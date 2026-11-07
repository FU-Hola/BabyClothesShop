package com.fptu.project_group2.warehouse.dto.response.GoodsIssue;

import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import java.time.Instant;
import java.util.UUID;

public record GoodsIssueResponse(
        UUID id,
        String code,
        UUID orderId,
        String orderCode,
        GoodsIssueStatus status,
        UUID assignedTo,
        Instant createdAt,
        Long version
) {}
