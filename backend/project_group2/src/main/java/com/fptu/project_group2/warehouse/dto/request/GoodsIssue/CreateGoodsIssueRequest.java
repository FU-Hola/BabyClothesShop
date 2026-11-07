package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record CreateGoodsIssueRequest(
        @NotNull UUID orderId
) {}
