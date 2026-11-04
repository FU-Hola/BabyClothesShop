package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.warehouse.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface StockRepository extends JpaRepository<Inventory, UUID> {

    @Query("""
            select i
            from Inventory i
            join ProductVariant v on v.id = i.variantId
            join v.product p
            where (
                lower(p.name) like :keyword
                or lower(v.sku) like :keyword
            )
            and (:categoryId is null or p.category.id = :categoryId)
            and (:variantSize is null or lower(v.size) = :variantSize)
            and (
                :inStock is null
                or (:inStock = true and i.quantity > 0)
                or (:inStock = false and i.quantity = 0)
            )
            order by v.sku asc, v.id asc, i.id asc
            """)
    Page<Inventory> searchStock(
            @Param("keyword") String keyword,
            @Param("categoryId") UUID categoryId,
            @Param("variantSize") String variantSize,
            @Param("inStock") Boolean inStock,
            Pageable pageable
    );

    @Query("""
            select coalesce(sum(i.quantity), 0)
            from Inventory i
            """)
    Long getTotalQuantity();
}
