package com.fptu.project_group2.cartcheckout.entity;

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

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "carts")
public class Cart extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private User customer;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "cart", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<CartItem> items = new ArrayList<>();

    public void addCartItem(CartItem item) {
        Objects.requireNonNull(item, "item");
        if (item.getCart() != null && item.getCart() != this) {
            throw new IllegalArgumentException("Item already belongs to another aggregate");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setCart(this);
    }
}
