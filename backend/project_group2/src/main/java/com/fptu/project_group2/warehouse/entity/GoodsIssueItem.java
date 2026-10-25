package com.fptu.project_group2.warehouse.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "goods_issue_items", indexes = @Index(name = "idx_goods_issue_items_issue", columnList = "goods_issue_id"), check = @CheckConstraint(constraint = "picked_quantity >= 0"))
public class GoodsIssueItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "goods_issue_id", nullable = false)
    private GoodsIssue goodsIssue;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_item_id", nullable = false, unique = true)
    private OrderItem orderItem;

    @Column(name = "picked_quantity", nullable = false)
    private int pickedQuantity = 0;
}
