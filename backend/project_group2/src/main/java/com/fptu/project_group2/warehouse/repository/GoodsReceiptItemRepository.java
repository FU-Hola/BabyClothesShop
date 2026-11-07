package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptItemResponse;
import com.fptu.project_group2.warehouse.entity.GoodsReceiptItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GoodsReceiptItemRepository extends JpaRepository<GoodsReceiptItem, UUID> {


    // Bổ sung variantId, tên sản phẩm và màu từ catalog; giữ nguyên entity phiếu nhập.
    @Query("""
        select new com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptItemResponse(
            i.id,
            i.variantId,
            v.sku,
            p.name,
            c.name,
            v.color,
            v.size,
            cast(coalesce(i.expectedQuantity, 0) as Long),
            cast(i.receivedQuantity as Long)
        ) from GoodsReceiptItem i left join ProductVariant v
        on i.variantId = v.id left join v.product p left join p.category c
        where i.goodsReceipt.id = :goodsReceiptId
""")
    Page<GoodsReceiptItemResponse> getAllItem(
            @Param("goodsReceiptId") UUID goodsReceiptId,
            Pageable pageable);

}
