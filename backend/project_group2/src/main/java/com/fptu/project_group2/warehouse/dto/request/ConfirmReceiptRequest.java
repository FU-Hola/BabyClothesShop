package com.fptu.project_group2.warehouse.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.util.List;
import java.util.UUID;

public record ConfirmReceiptRequest(
        @NotNull @PositiveOrZero Long version,
        @Size(max = 1000) String discrepancyNote,
        @NotNull String goodsReceiptStatus,
        @NotEmpty @Size(max = 200) List<@NotNull @Valid Line> items
) {
    public record Line(@NotNull @Positive Long receiptItemId,
                       @NotNull @PositiveOrZero Integer receivedQuantity) {}
}