package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.common.PackagingType;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "goods_issues", indexes = {@Index(name = "idx_goods_issues_status_created", columnList = "status, created_at"), @Index(name = "idx_goods_issues_assigned", columnList = "assigned_to")})
public class GoodsIssue extends BaseEntity {

    @Column(name = "code", nullable = false, length = 40, unique = true)
    private String code;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private GoodsIssueStatus status = GoodsIssueStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "assigned_to", nullable = true)
    private User assignedTo;

    @Column(name = "picking_started_at", nullable = true)
    private Instant pickingStartedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "packed_by", nullable = true)
    private User packedBy;

    @Column(name = "packed_at", nullable = true)
    private Instant packedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "packaging_type", nullable = true, length = 32)
    private PackagingType packagingType;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "exported_by", nullable = true)
    private User exportedBy;

    @Column(name = "exported_at", nullable = true)
    private Instant exportedAt;

    @Column(name = "carrier_name", nullable = true, length = 255)
    private String carrierName;

    @Column(name = "tracking_number", nullable = true, length = 100)
    private String trackingNumber;

    @Column(name = "note", nullable = true, length = 1000)
    private String note;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "goodsIssue", cascade = CascadeType.PERSIST, fetch = FetchType.LAZY)
    private List<GoodsIssueItem> items = new ArrayList<>();

    public void addGoodsIssueItem(GoodsIssueItem item) {
        Objects.requireNonNull(item, "item");
        if (item.getGoodsIssue() != null && item.getGoodsIssue() != this) {
            throw new IllegalArgumentException("Item already belongs to another aggregate");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setGoodsIssue(this);
    }
}
