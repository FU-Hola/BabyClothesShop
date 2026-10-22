package com.fptu.project_group2.catalogstock.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "product_variants", uniqueConstraints = @UniqueConstraint(name = "uk_variant_product_color_size", columnNames = {"product_id", "color", "size"}), check = @CheckConstraint(constraint = "price >= 0 and (original_price is null or original_price >= price)"))
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "sku", nullable = false, length = 64, unique = true)
    private String sku;

    @Column(name = "color", nullable = false, length = 100)
    private String color;

    @Column(name = "size", nullable = false, length = 40)
    private String size;

    @Column(name = "price", nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", nullable = true, precision = 19, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
