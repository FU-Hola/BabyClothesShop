package com.fptu.project_group2.warehouse.repository;
import com.fptu.project_group2.warehouse.entity.GoodsReceipt;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptResponse;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import java.util.UUID;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import org.springframework.data.repository.query.Param;
public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, UUID> {
    // Data query và countQuery dùng cùng bộ lọc để không lệch tổng số trang.
    @Query(value = """
        select new com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptResponse(
            g.id, g.code, g.supplierName, g.createdAt,
            cast(coalesce(sum(i.expectedQuantity), 0) as Long), g.goodsReceiptStatus, g.version)
        from GoodsReceipt g left join g.items i
        where (:status is null or g.goodsReceiptStatus = :status)
          and (lower(g.code) like :keyword escape '!'
               or lower(g.supplierName) like :keyword escape '!')
        group by g.id, g.code, g.supplierName, g.createdAt, g.goodsReceiptStatus, g.version
        """, countQuery = """
        select count(g) from GoodsReceipt g
        where (:status is null or g.goodsReceiptStatus = :status)
          and (lower(g.code) like :keyword escape '!'
               or lower(g.supplierName) like :keyword escape '!')
        """)
    Page<GoodsReceiptResponse> getAllGoodsReceipt(
            @Param("status") GoodsReceiptStatus status,
            @Param("keyword") String keyword,
            Pageable pageable);
}
