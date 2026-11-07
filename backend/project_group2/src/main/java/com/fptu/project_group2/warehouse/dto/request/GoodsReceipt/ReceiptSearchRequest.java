package com.fptu.project_group2.warehouse.dto.request.GoodsReceipt;

import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import jakarta.validation.constraints.Size;

// Bộ lọc nghiệp vụ tách khỏi PagingRequest dùng chung.
public record ReceiptSearchRequest(
        GoodsReceiptStatus status,
        @Size(max = 100) String keyword
) {}
