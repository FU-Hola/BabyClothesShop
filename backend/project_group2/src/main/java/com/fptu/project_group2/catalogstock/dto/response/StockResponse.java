package com.fptu.project_group2.catalogstock.dto.response;

import com.fptu.project_group2.catalogstock.common.StockStatus;
import lombok.Builder;
import lombok.Getter;

import java.util.UUID;

@Getter
@Builder
public class StockResponse {

    private UUID variantId;

    private UUID productId;

    private String productName;

    private String sku;

    private String color;

    private String size;

    private UUID categoryId;

    private String categoryName;

    private Long quantity;

    private StockStatus stockStatus;
}