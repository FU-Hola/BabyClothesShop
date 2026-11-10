package com.fptu.project_group2.cartcheckout.service;

import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.service.IInventoryReservation;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutExpiryService {
    private final OrderRepository orders;
    private final IInventoryReservation reservations;
    private final JdbcTemplate jdbc;

    @Transactional
    public boolean expire(UUID id) {
        Order order=orders.findByIdForUpdate(id).orElse(null);
        return order != null && expireLocked(order);
    }

    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.MANDATORY)
    public boolean expireLocked(Order order) {
        if(order.getStatus()!=OrderStatus.PENDING_PAYMENT || order.getPaymentExpiresAt().isAfter(reservations.now())) return false;
        reservations.release(order);
        order.setStatus(OrderStatus.EXPIRED);
        order.setPaymentStatus(PaymentStatus.EXPIRED);
        return true;
    }

    @Transactional
    public void expireForCart(UUID cart) {
        for(UUID id: jdbc.queryForList("SELECT id FROM shop.orders WHERE cart_id=? AND status='PENDING_PAYMENT' "
                + "AND payment_expires_at<=clock_timestamp() ORDER BY id",UUID.class,cart)) expire(id);
    }
}
