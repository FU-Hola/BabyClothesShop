package com.fptu.project_group2.warehouse.dto.response.GoodsIssue;

import java.util.UUID;

public record GoodsIssueItemResponse(
        UUID issueItemId,
        UUID orderItemId,
        UUID variantId,
        String sku,
        String productName,
        String color,
        String size,
        int orderedQuantity,
        int pickedQuantity
) {}
