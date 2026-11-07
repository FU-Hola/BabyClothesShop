package com.fptu.project_group2.warehouse.dto.response.GoodsReceipt;

import java.util.UUID;

public record GoodsReceiptItemResponse(
        UUID goodsReceiptItemId,
        UUID variantId,
        String sku,
        String productName,
        String categoryName,
        String color,
        String size,
        Long expectedQuantity,
        Long receivedQuantity
) {}
