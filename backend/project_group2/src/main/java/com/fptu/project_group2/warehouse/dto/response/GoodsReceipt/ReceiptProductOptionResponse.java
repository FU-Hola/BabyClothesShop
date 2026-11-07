package com.fptu.project_group2.warehouse.dto.response.GoodsReceipt;

import java.util.UUID;

public record ReceiptProductOptionResponse(UUID productId, String productName, String categoryName) {}
