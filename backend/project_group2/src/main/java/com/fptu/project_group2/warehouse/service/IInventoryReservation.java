package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.ordermanagement.entity.Order;
import java.time.Instant;
import java.util.UUID;

public interface IInventoryReservation {
    Instant now();
    void hold(Order order);
    void requireCommitted(Order order);
    void commit(Order order);
    void release(Order order);
    void consume(Order order);
    void receive(UUID variantId, UUID receiptItemId, long quantity, UUID receiptId);
}
