package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.warehouse.common.ReservationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Builder
@Getter
@Setter
@Entity
@Table(name = "inventory_reservations", schema = "shop")
@AllArgsConstructor
@NoArgsConstructor
public class InventoryReservation {

    @Id
    @Column(name = "order_item_id")
    private UUID orderItemId;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "quantity")
    private Long quantity;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ReservationStatus status;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private Instant updatedAt;
}
