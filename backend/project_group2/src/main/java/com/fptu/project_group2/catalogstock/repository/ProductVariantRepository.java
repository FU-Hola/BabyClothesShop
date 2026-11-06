package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    List<ProductVariant> findAllByProductId(UUID productId);

    boolean existsBySkuIgnoreCase(String sku);

    @Query("""
            select case when count(item) > 0 then true else false end
            from GoodsReceiptItem item
            where item.variantId = :variantId
            """)
    boolean existsInGoodsReceipt(@Param("variantId") UUID variantId);

    @Query("""
            select case when count(item) > 0 then true else false end
            from OrderItem item
            where item.variant.id = :variantId
            """)
    boolean existsInOrder(@Param("variantId") UUID variantId);
}
