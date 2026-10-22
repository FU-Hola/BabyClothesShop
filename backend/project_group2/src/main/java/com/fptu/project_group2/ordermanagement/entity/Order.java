package com.fptu.project_group2.ordermanagement.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.PaymentMethod;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orders", indexes = {@Index(name = "idx_orders_customer_created", columnList = "customer_id, created_at"), @Index(name = "idx_orders_status_created", columnList = "status, created_at")}, check = @CheckConstraint(constraint = "shipping_fee >= 0"))
public class Order extends BaseEntity {

    @Column(name = "order_code", nullable = false, length = 40, unique = true)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "checkout_key", nullable = false, length = 100, unique = true)
    private String checkoutKey;

    @Column(name = "receiver_name", nullable = false, length = 255)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 32)
    private String receiverPhone;

    @Column(name = "receiver_address", nullable = false, length = 1000)
    private String receiverAddress;

    @Column(name = "customer_note", nullable = true, length = 1000)
    private String customerNote;

    @Column(name = "shipping_fee", nullable = false, precision = 19, scale = 2)
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private OrderStatus status = OrderStatus.PENDING_CONFIRMATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 32)
    private PaymentMethod paymentMethod = PaymentMethod.SIMULATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 32)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "paid_at", nullable = true)
    private Instant paidAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "confirmed_by", nullable = true)
    private User confirmedBy;

    @Column(name = "confirmed_at", nullable = true)
    private Instant confirmedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "delivered_by", nullable = true)
    private User deliveredBy;

    @Column(name = "delivered_at", nullable = true)
    private Instant deliveredAt;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "order", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<OrderItem> items = new ArrayList<>();

    public void addOrderItem(OrderItem item) {
        Objects.requireNonNull(item, "item");
        if (item.getOrder() != null && item.getOrder() != this) {
            throw new IllegalArgumentException("Item already belongs to another aggregate");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setOrder(this);
    }
}
