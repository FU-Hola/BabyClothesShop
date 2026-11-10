package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;

public record ExportIssueRequest(
        @NotNull @PositiveOrZero Long version,
        @NotBlank @Size(max = 255) String carrierName,
        @Size(max = 1000) String note
) {}
