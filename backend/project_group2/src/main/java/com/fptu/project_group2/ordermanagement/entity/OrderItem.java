package com.fptu.project_group2.ordermanagement.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "order_items", indexes = {@Index(name = "idx_order_items_order", columnList = "order_id"), @Index(name = "idx_order_items_variant", columnList = "variant_id")}, check = @CheckConstraint(constraint = "quantity > 0 and unit_price >= 0"))
public class OrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "product_name_snapshot", nullable = false, length = 255)
    private String productNameSnapshot;

    @Column(name = "sku_snapshot", nullable = false, length = 64)
    private String skuSnapshot;

    @Column(name = "color_snapshot", nullable = false, length = 100)
    private String colorSnapshot;

    @Column(name = "size_snapshot", nullable = false, length = 40)
    private String sizeSnapshot;

    @Column(name = "image_url_snapshot", nullable = true, length = 2048)
    private String imageUrlSnapshot;
}
