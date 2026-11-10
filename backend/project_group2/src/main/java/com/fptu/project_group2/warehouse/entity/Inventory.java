package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;


@Builder
@Getter
@Setter
@Entity
@Table(name = "inventory")
@AllArgsConstructor
@NoArgsConstructor
public class Inventory extends BaseEntity {

    @Column(nullable = false)
    private Long quantity;

    @Builder.Default
    @Column(name = "reserved_quantity", nullable = false, insertable = false, updatable = false)
    private Long reservedQuantity = 0L;

    public long getAvailableQuantity() {
        return quantity - reservedQuantity;
    }

    @Column(name = "variant_id", nullable = false, unique = true)
    private UUID variantId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false, unique = true, insertable = false, updatable = false)
    private ProductVariant variant;
}
