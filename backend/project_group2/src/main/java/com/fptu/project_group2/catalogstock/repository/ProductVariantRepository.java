package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;
import java.util.Collection;
import java.util.List;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptVariantOptionResponse;


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



    @Query("""
        select case when count (v) > 0 then true else false end
        from ProductVariant v join Inventory i on v.id = i.variant.id join v.product p
        where v.id = :variantId
                    and p.status = :productStatus
                    and v.active is true
""")
    boolean existProductVariant(@Param("variantId") UUID variantId,
                                @Param("productStatus") ProductStatus productStatus

    );


    @Query("""
        select v.id from ProductVariant v
        join v.product p
        join Inventory i on i.variant.id = v.id
        where v.id in :ids and p.status = :status and v.active = true
        """)
    List<UUID> findReceivableIds(@Param("ids") Collection<UUID> ids,
                                 @Param("status") ProductStatus status);

    @Query("""
        select new com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptVariantOptionResponse(
            v.id, v.sku, v.color, v.size, i.quantity)
        from Inventory i join i.variant v join v.product p
        where p.id = :productId and p.status = :status and v.active = true
        order by v.sku, v.id
        """)
    List<ReceiptVariantOptionResponse> findReceiptVariants(
            @Param("productId") UUID productId,
            @Param("status") ProductStatus status);
}
