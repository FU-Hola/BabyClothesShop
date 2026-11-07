package com.fptu.project_group2.warehouse.dto.request.GoodsReceipt;
import jakarta.validation.constraints.*;
public record CancelReceiptRequest(
        @NotNull @PositiveOrZero Long version,
        @Size(max = 1000) String note) {}
