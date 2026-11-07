package com.fptu.project_group2.warehouse.dto.response.GoodsIssue;

import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.common.PackagingType;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record GoodsIssueDetailResponse(
        UUID id,
        String code,
        UUID orderId,
        String orderCode,
        OrderStatus orderStatus,
        GoodsIssueStatus status,
        Long version,
        String receiverName,
        String receiverPhone,
        String receiverAddress,
        UUID assignedTo,
        Instant pickingStartedAt,
        UUID packedBy,
        Instant packedAt,
        PackagingType packagingType,
        UUID exportedBy,
        Instant exportedAt,
        String carrierName,
        String trackingNumber,
        String note,
        UUID cancelledBy,
        Instant cancelledAt,
        String cancellationReason,
        Instant createdAt,
        List<GoodsIssueItemResponse> items
) {}
