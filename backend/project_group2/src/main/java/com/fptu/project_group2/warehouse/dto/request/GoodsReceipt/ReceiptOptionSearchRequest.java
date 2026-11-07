package com.fptu.project_group2.warehouse.dto.request.GoodsReceipt;

import jakarta.validation.constraints.Size;

public record ReceiptOptionSearchRequest(@Size(max = 100) String keyword) {}
