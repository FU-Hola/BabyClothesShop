package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {

    Optional<Inventory> findByVariantId(UUID variantId);

    @Modifying
    @Query(value = """
        update shop.inventory
                set quantity = quantity + :receivedQuantity, updated_at = now()
                where variant_id = :variantId;
        """, nativeQuery = true)
    int increaseStock(@Param("variantId") UUID variantId, @Param("receivedQuantity") Integer receivedQuantity);

    @Modifying
    @Query(value = """
        UPDATE shop.inventory
        SET reserved_quantity = reserved_quantity + :quantity, updated_at = clock_timestamp()
        WHERE variant_id = :variantId AND quantity - reserved_quantity >= :quantity
        """, nativeQuery = true)
    int reserveStock(@Param("variantId") UUID variantId, @Param("quantity") long quantity);

    @Modifying
    @Query(value = """
        UPDATE shop.inventory
        SET reserved_quantity = reserved_quantity - :quantity, updated_at = clock_timestamp()
        WHERE variant_id = :variantId AND reserved_quantity >= :quantity
        """, nativeQuery = true)
    int releaseReservedStock(@Param("variantId") UUID variantId, @Param("quantity") long quantity);

    @Modifying
    @Query(value = """
        UPDATE shop.inventory
        SET quantity = quantity - :quantity,
            reserved_quantity = reserved_quantity - :quantity,
            updated_at = clock_timestamp()
        WHERE variant_id = :variantId AND quantity >= :quantity AND reserved_quantity >= :quantity
        """, nativeQuery = true)
    int consumeReservedStock(@Param("variantId") UUID variantId, @Param("quantity") long quantity);

}
