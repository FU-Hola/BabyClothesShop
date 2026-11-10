package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.ordermanagement.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

/** Caller owns the order lock. Balance, reservation and ledger share its transaction. */
@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.MANDATORY)
public class InventoryReservationService {
    private final JdbcTemplate jdbc;
    private record Reservation(UUID item, UUID variant, long quantity, String status) {}

    public Instant now() {
        return jdbc.queryForObject("SELECT clock_timestamp()", (rs, n) -> rs.getTimestamp(1).toInstant());
    }

    public void hold(Order order) {
        var lines = order.getItems().stream()
                .sorted(Comparator.comparing(i -> i.getVariant().getId().toString())).toList();
        if (lines.isEmpty()) throw conflict("Đơn hàng không có sản phẩm");
        for (var line : lines) {
            long quantity = line.getQuantity();
            UUID variant = line.getVariant().getId();
            if (quantity <= 0 || jdbc.update("""
                    UPDATE shop.inventory SET reserved_quantity=reserved_quantity+?, updated_at=clock_timestamp()
                    WHERE variant_id=? AND quantity-reserved_quantity>=?
                    """, quantity, variant, quantity) != 1) {
                throw conflict("Không đủ hàng có thể bán cho SKU " + line.getSkuSnapshot());
            }
            jdbc.update("""
                    INSERT INTO shop.inventory_reservations(order_item_id,order_id,variant_id,quantity,status,expires_at)
                    VALUES (?,?,?,?,'HELD',?)
                    """, line.getId(), order.getId(), variant, quantity, java.sql.Timestamp.from(order.getPaymentExpiresAt()));
            ledger(variant, line.getId(), "RESERVE", 0, quantity, order.getId());
        }
    }

    private List<Reservation> locked(Order order) {
        var rows = jdbc.query("""
                SELECT order_item_id,variant_id,quantity,status FROM shop.inventory_reservations
                WHERE order_id=? ORDER BY variant_id,order_item_id FOR UPDATE
                """, (rs,n) -> new Reservation(rs.getObject(1,UUID.class), rs.getObject(2,UUID.class), rs.getLong(3), rs.getString(4)), order.getId());
        if (rows.size() != order.getItems().size() || rows.isEmpty()) throw conflict("Đơn hàng thiếu reservation; cần đối soát");
        Map<UUID, Reservation> byItem = new HashMap<>();
        rows.forEach(r -> byItem.put(r.item(), r));
        for (var item : order.getItems()) {
            var r = byItem.get(item.getId());
            if (r == null || !r.variant().equals(item.getVariant().getId()) || r.quantity()!=item.getQuantity())
                throw conflict("Reservation không khớp dòng đơn hàng");
        }
        return rows;
    }

    public void requireCommitted(Order order) {
        if (locked(order).stream().anyMatch(r -> !"COMMITTED".equals(r.status())))
            throw conflict("Đơn chưa có đủ hàng đã giữ sau thanh toán");
    }

    public void commit(Order order) {
        var rows = locked(order);
        if (rows.stream().anyMatch(r -> !"HELD".equals(r.status()))) throw conflict("Phiên giữ hàng không còn hiệu lực");
        jdbc.update("UPDATE shop.inventory_reservations SET status='COMMITTED',updated_at=clock_timestamp() WHERE order_id=?", order.getId());
    }

    public void release(Order order) {
        for (var r : locked(order)) {
            if (!Set.of("HELD", "COMMITTED").contains(r.status())) throw conflict("Không thể giải phóng reservation đã xử lý");
            if (jdbc.update("UPDATE shop.inventory SET reserved_quantity=reserved_quantity-?,updated_at=clock_timestamp() "
                    + "WHERE variant_id=? AND reserved_quantity>=?", r.quantity(),r.variant(),r.quantity())!=1)
                throw conflict("Tồn giữ chỗ không khớp; cần đối soát");
            jdbc.update("UPDATE shop.inventory_reservations SET status='RELEASED',updated_at=clock_timestamp() WHERE order_item_id=?",r.item());
            ledger(r.variant(), r.item(), "RELEASE", 0, -r.quantity(), order.getId());
        }
    }

    public void consume(Order order) {
        var rows = locked(order);
        if (rows.stream().anyMatch(r -> !"COMMITTED".equals(r.status()))) throw conflict("Đơn không có reservation để xuất");
        for (var r : rows) {
            if (jdbc.update("""
                    UPDATE shop.inventory SET quantity=quantity-?,reserved_quantity=reserved_quantity-?,updated_at=clock_timestamp()
                    WHERE variant_id=? AND quantity>=? AND reserved_quantity>=?
                    """,r.quantity(),r.quantity(),r.variant(),r.quantity(),r.quantity())!=1)
                throw conflict("Không đủ tồn đã giữ để xuất; cần đối soát");
            jdbc.update("UPDATE shop.inventory_reservations SET status='CONSUMED',updated_at=clock_timestamp() WHERE order_item_id=?",r.item());
            ledger(r.variant(),r.item(),"SHIP",-r.quantity(),-r.quantity(),order.getId());
        }
    }

    public void receive(UUID variant, UUID receiptItem, long quantity, UUID receipt) {
        ledger(variant,receiptItem,"RECEIVE",quantity,0,receipt);
    }

    private void ledger(UUID variant, UUID source, String effect, long physical, long reserved, UUID document) {
        var authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        UUID actor = authentication != null && authentication.getPrincipal() instanceof
                com.fptu.project_group2.authaccount.security.AuthenticatedUser user ? user.id() : null;
        jdbc.update("""
                INSERT INTO shop.inventory_ledger(variant_id,source_line_id,effect,quantity_delta,reserved_delta,document_id,actor_id)
                VALUES (?,?,?,?,?,?,?)
                """,variant,source,effect,physical,reserved,document,actor);
    }

    private BaseBusinessException conflict(String message) { return new BaseBusinessException(ErrorCode.CONFLICT,message); }
}
