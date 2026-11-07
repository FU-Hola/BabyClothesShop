package com.fptu.project_group2.warehouse.dto.response.GoodsReceipt;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import java.time.Instant;
import java.util.UUID;
public record GoodsReceiptResponse(
        UUID goodsReceiptId,
        String code,
        String supplierName,
        Instant createdAt,
        Long expectedQuantity,
        GoodsReceiptStatus goodsReceiptStatus,
        Long version) {}
