package com.fptu.project_group2.warehouse.dto.response;

import com.fptu.project_group2.warehouse.common.ReservationStatus;
import java.util.UUID;

public interface InventoryReservationView {
    UUID getOrderItemId();
    UUID getVariantId();
    long getQuantity();
    ReservationStatus getStatus();
}
