package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.warehouse.common.InventoryLedgerEffect;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Builder
@Getter
@Setter
@Entity
@Table(name = "inventory_ledger", schema = "shop")
@AllArgsConstructor
@NoArgsConstructor
public class InventoryLedger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "variant_id")
    private UUID variantId;

    @Column(name = "source_line_id")
    private UUID sourceLineId;

    @Enumerated(EnumType.STRING)
    @Column(name = "effect")
    private InventoryLedgerEffect effect;

    @Column(name = "quantity_delta")
    private Long quantityDelta;

    @Column(name = "reserved_delta")
    private Long reservedDelta;

    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "actor_id")
    private UUID actorId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private Instant createdAt;
}
