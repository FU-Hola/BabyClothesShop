package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import jakarta.validation.constraints.Size;
import java.util.UUID;

// Hỗ trợ tìm theo mã phiếu/mã đơn; giữ orderId cho liên kết từ module Order.
public record IssueSearchRequest(
        GoodsIssueStatus status,
        UUID orderId,
        @Size(max = 100) String keyword
) {}
