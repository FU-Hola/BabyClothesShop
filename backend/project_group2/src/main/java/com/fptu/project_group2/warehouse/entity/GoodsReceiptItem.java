package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Check;

import java.util.UUID;

@Builder
@Getter
@Setter
@Entity
@Table(name = "goods_receipt_items", uniqueConstraints =
@UniqueConstraint(columnNames = {"goods_receipt_id", "variant_id"} ))
@Check(constraints = "expected_quantity > 0")
@AllArgsConstructor
@NoArgsConstructor
public class GoodsReceiptItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_receipt_id", nullable = false)
    private GoodsReceipt goodsReceipt;

    @Column(name = "variant_id", nullable = false)
    private UUID variantId;

    @Column(nullable = false)
    private Integer expectedQuantity;

    private Integer receivedQuantity;
}
