package com.fptu.project_group2.cartcheckout.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint(name = "uk_cart_item_variant", columnNames = {"cart_id", "variant_id"}), indexes = @Index(name = "idx_cart_items_variant", columnList = "variant_id"), check = @CheckConstraint(constraint = "quantity > 0"))
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

}
