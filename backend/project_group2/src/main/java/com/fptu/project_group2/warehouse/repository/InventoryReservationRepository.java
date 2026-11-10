package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.dto.response.InventoryReservationView;
import com.fptu.project_group2.warehouse.entity.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface InventoryReservationRepository extends JpaRepository<InventoryReservation, UUID> {

    @Query(value = "SELECT clock_timestamp()", nativeQuery = true)
    Instant currentDatabaseTime();

    // Scalar projection avoids stale entity state after native status updates.
    @Query(value = """
        SELECT order_item_id AS "orderItemId", variant_id AS "variantId", quantity, status
        FROM shop.inventory_reservations
        WHERE order_id = :orderId
        ORDER BY variant_id, order_item_id
        FOR UPDATE
        """, nativeQuery = true)
    List<InventoryReservationView> findByOrderIdForUpdate(@Param("orderId") UUID orderId);

    @Modifying
    @Query(value = """
        UPDATE shop.inventory_reservations
        SET status = :status, updated_at = clock_timestamp()
        WHERE order_id = :orderId
        """, nativeQuery = true)
    int updateStatusByOrderId(@Param("orderId") UUID orderId, @Param("status") String status);

    @Modifying
    @Query(value = """
        UPDATE shop.inventory_reservations
        SET status = :status, updated_at = clock_timestamp()
        WHERE order_item_id = :orderItemId
        """, nativeQuery = true)
    int updateStatusByOrderItemId(@Param("orderItemId") UUID orderItemId, @Param("status") String status);
}
