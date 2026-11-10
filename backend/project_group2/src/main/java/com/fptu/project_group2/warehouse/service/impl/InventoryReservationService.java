package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.security.CurrentActorProvider;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.warehouse.common.InventoryLedgerEffect;
import com.fptu.project_group2.warehouse.common.ReservationStatus;
import com.fptu.project_group2.warehouse.dto.response.InventoryReservationView;
import com.fptu.project_group2.warehouse.entity.InventoryLedger;
import com.fptu.project_group2.warehouse.entity.InventoryReservation;
import com.fptu.project_group2.warehouse.repository.InventoryLedgerRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import com.fptu.project_group2.warehouse.repository.InventoryReservationRepository;
import com.fptu.project_group2.warehouse.service.IInventoryReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(propagation = Propagation.MANDATORY)
public class InventoryReservationService implements IInventoryReservation {

    private final InventoryRepository inventoryRepository;
    private final InventoryReservationRepository reservationRepository;
    private final InventoryLedgerRepository ledgerRepository;
    private final CurrentActorProvider currentActorProvider;

    @Override
    public Instant now() {
        return reservationRepository.currentDatabaseTime();
    }

    @Override
    public void hold(Order order) {
        List<OrderItem> orderItems = order.getItems().stream()
                .sorted(Comparator.comparing(item -> item.getVariant().getId().toString()))
                .toList();

        if (orderItems.isEmpty()) {
            throw conflict("Đơn hàng không có sản phẩm");
        }

        for (OrderItem orderItem : orderItems) {
            long quantity = orderItem.getQuantity();
            UUID variantId = orderItem.getVariant().getId();

            if (quantity <= 0 || inventoryRepository.reserveStock(variantId, quantity) != 1) {
                throw conflict("Không đủ hàng có thể bán cho SKU " + orderItem.getSkuSnapshot());
            }

            InventoryReservation reservation = InventoryReservation.builder()
                    .orderItemId(orderItem.getId())
                    .orderId(order.getId())
                    .variantId(variantId)
                    .quantity(quantity)
                    .status(ReservationStatus.HELD)
                    .expiresAt(order.getPaymentExpiresAt())
                    .build();
            reservationRepository.saveAndFlush(reservation);
            recordLedger(variantId, orderItem.getId(), InventoryLedgerEffect.RESERVE, 0, quantity, order.getId());
        }
    }

    @Override
    public void requireCommitted(Order order) {
        List<InventoryReservationView> reservations = lockAndValidateReservations(order);
        validateStatus(reservations, ReservationStatus.COMMITTED, "Đơn chưa có đủ hàng đã giữ sau thanh toán");
    }

    @Override
    public void commit(Order order) {
        List<InventoryReservationView> reservations = lockAndValidateReservations(order);
        validateStatus(reservations, ReservationStatus.HELD, "Phiên giữ hàng không còn hiệu lực");
        reservationRepository.updateStatusByOrderId(order.getId(), ReservationStatus.COMMITTED.name());
    }

    @Override
    public void release(Order order) {
        List<InventoryReservationView> reservations = lockAndValidateReservations(order);

        for (InventoryReservationView reservation : reservations) {
            if (reservation.getStatus() != ReservationStatus.HELD
                    && reservation.getStatus() != ReservationStatus.COMMITTED) {
                throw conflict("Không thể giải phóng reservation đã xử lý");
            }

            if (inventoryRepository.releaseReservedStock(reservation.getVariantId(), reservation.getQuantity()) != 1) {
                throw conflict("Tồn giữ chỗ không khớp; cần đối soát");
            }

            reservationRepository.updateStatusByOrderItemId(reservation.getOrderItemId(), ReservationStatus.RELEASED.name());
            recordLedger(reservation.getVariantId(), reservation.getOrderItemId(), InventoryLedgerEffect.RELEASE,
                    0, -reservation.getQuantity(), order.getId());
        }
    }

    @Override
    public void consume(Order order) {
        List<InventoryReservationView> reservations = lockAndValidateReservations(order);
        validateStatus(reservations, ReservationStatus.COMMITTED, "Đơn không có reservation để xuất");

        for (InventoryReservationView reservation : reservations) {
            if (inventoryRepository.consumeReservedStock(reservation.getVariantId(), reservation.getQuantity()) != 1) {
                throw conflict("Không đủ tồn đã giữ để xuất; cần đối soát");
            }

            reservationRepository.updateStatusByOrderItemId(reservation.getOrderItemId(), ReservationStatus.CONSUMED.name());
            recordLedger(reservation.getVariantId(), reservation.getOrderItemId(), InventoryLedgerEffect.SHIP,
                    -reservation.getQuantity(), -reservation.getQuantity(), order.getId());
        }
    }

    @Override
    public void receive(UUID variantId, UUID receiptItemId, long quantity, UUID receiptId) {
        recordLedger(variantId, receiptItemId, InventoryLedgerEffect.RECEIVE, quantity, 0, receiptId);
    }

    private List<InventoryReservationView> lockAndValidateReservations(Order order) {
        List<InventoryReservationView> reservations = reservationRepository.findByOrderIdForUpdate(order.getId());

        if (reservations.isEmpty() || reservations.size() != order.getItems().size()) {
            throw conflict("Đơn hàng thiếu reservation; cần đối soát");
        }

        Map<UUID, InventoryReservationView> reservationsByOrderItemId = new HashMap<>();
        for (InventoryReservationView reservation : reservations) {
            reservationsByOrderItemId.put(reservation.getOrderItemId(), reservation);
        }

        for (OrderItem orderItem : order.getItems()) {
            InventoryReservationView reservation = reservationsByOrderItemId.get(orderItem.getId());
            if (reservation == null
                    || !reservation.getVariantId().equals(orderItem.getVariant().getId())
                    || reservation.getQuantity() != orderItem.getQuantity()) {
                throw conflict("Reservation không khớp dòng đơn hàng");
            }
        }
        return reservations;
    }

    private void validateStatus(List<InventoryReservationView> reservations,
                                ReservationStatus expectedStatus, String message) {
        if (reservations.stream().anyMatch(reservation -> reservation.getStatus() != expectedStatus)) {
            throw conflict(message);
        }
    }

    private void recordLedger(UUID variantId, UUID sourceLineId, InventoryLedgerEffect effect,
                              long quantityDelta, long reservedDelta, UUID documentId) {
        InventoryLedger ledger = InventoryLedger.builder()
                .variantId(variantId)
                .sourceLineId(sourceLineId)
                .effect(effect)
                .quantityDelta(quantityDelta)
                .reservedDelta(reservedDelta)
                .documentId(documentId)
                .actorId(currentActorProvider.currentActorIdOrNull())
                .build();
        ledgerRepository.save(ledger);
    }

    private BaseBusinessException conflict(String message) {
        return new BaseBusinessException(ErrorCode.CONFLICT, message);
    }
}
