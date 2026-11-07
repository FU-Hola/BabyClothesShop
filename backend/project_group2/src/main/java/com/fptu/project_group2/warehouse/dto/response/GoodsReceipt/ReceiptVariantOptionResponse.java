package com.fptu.project_group2.warehouse.dto.response.GoodsReceipt;

import java.util.UUID;

public record ReceiptVariantOptionResponse(UUID variantId, String sku, String color, String size, Long quantity) {}
