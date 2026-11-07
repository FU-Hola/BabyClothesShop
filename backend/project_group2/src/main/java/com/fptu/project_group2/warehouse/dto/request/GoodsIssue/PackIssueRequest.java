package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;
import com.fptu.project_group2.warehouse.common.PackagingType;

public record PackIssueRequest(
        @NotNull @PositiveOrZero Long version,
        @NotNull PackagingType packagingType
) {}
