package com.fptu.project_group2.ordermanagement.repository;

import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("""
        SELECT COALESCE(SUM(oi.quantity), 0L)
        FROM OrderItem oi
        WHERE oi.variant.id = :variantId
          AND oi.order.status IN (
              com.fptu.project_group2.ordermanagement.common.OrderStatus.PENDING_CONFIRMATION,
              com.fptu.project_group2.ordermanagement.common.OrderStatus.CONFIRMED,
              com.fptu.project_group2.ordermanagement.common.OrderStatus.PACKED
          )
    """)
    Long sumHeldQuantityByVariantId(@Param("variantId") UUID variantId);
}

