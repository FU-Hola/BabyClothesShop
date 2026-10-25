package com.fptu.project_group2.catalogstock.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.catalogstock.common.ProductStatus;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "products", indexes = @Index(name = "idx_products_category", columnList = "category_id"))
public class Product extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private ProductStatus status = ProductStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "product", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<ProductVariant> variants = new ArrayList<>();

    public void addProductVariant(ProductVariant item) {
        Objects.requireNonNull(item, "item");
        if (item.getProduct() != null && item.getProduct() != this) {
            throw new IllegalArgumentException("Item already belongs to another aggregate");
        }
        if (!variants.contains(item)) {
            variants.add(item);
        }
        item.setProduct(this);
    }
    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "product", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<ProductImage> images = new ArrayList<>();

    public void addProductImage(ProductImage item) {
        Objects.requireNonNull(item, "item");
        if (item.getProduct() != null && item.getProduct() != this) {
            throw new IllegalArgumentException("Item already belongs to another aggregate");
        }
        if (!images.contains(item)) {
            images.add(item);
        }
        item.setProduct(this);
    }
}
