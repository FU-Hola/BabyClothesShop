package com.fptu.project_group2.warehouse.dto.response.GoodsReceipt;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.*;
import java.util.*;
public record GoodsReceiptDetailResponse(UUID goodsReceiptId,
                                         String code,
                                         String supplierName,
                                         LocalDate expectedDate,
                                         String note,
                                         GoodsReceiptStatus goodsReceiptStatus,
                                         UUID createdBy,
                                         Instant createdAt,
                                         Instant confirmAt,
                                         String discrepancyNote,
                                         Long version,
                                         List<GoodsReceiptItemResponse> items) {
    @JsonProperty("confirmedAt")
    public Instant confirmedAt() {
        return goodsReceiptStatus == GoodsReceiptStatus.COMPLETED ? confirmAt : null;
    }

    @JsonProperty("cancelledAt")
    public Instant cancelledAt() {
        return goodsReceiptStatus == GoodsReceiptStatus.CANCELLED ? confirmAt : null;
    }

    @JsonProperty("cancellationReason")
    public String cancellationReason() {
        return goodsReceiptStatus == GoodsReceiptStatus.CANCELLED ? discrepancyNote : null;
    }
}
