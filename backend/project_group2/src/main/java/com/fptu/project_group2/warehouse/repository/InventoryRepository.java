package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {


    @Modifying
    @Query(value = """
        update inventory
                set quantity = quantity + :receiveQuantity, updated_at = now()
                where variant_id = :variantId;
        """, nativeQuery = true)
    int increaseStock(@Param("variantId") UUID variantId,@Param("receiveQuantity") Integer receivedQuantity);
}
