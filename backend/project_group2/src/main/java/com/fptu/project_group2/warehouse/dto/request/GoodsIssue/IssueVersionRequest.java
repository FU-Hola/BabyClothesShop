package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;

public record IssueVersionRequest(
            @NotNull @PositiveOrZero Long version
    ) {}
