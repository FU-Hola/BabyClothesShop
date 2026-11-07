package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;

@Builder
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "goods_issue_items",
        uniqueConstraints = @UniqueConstraint(name = "uk_issue_order_item", columnNames = {"goods_issue_id", "order_item_id"}),
        indexes = @Index(name = "idx_goods_issue_items_issue", columnList = "goods_issue_id"),
        check = @CheckConstraint(constraint = "picked_quantity >= 0"))
public class GoodsIssueItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_issue_id", nullable = false)
    private GoodsIssue goodsIssue;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false)
    private OrderItem orderItem;

    @Column(name = "picked_quantity", nullable = false)
    private int pickedQuantity = 0;
}
