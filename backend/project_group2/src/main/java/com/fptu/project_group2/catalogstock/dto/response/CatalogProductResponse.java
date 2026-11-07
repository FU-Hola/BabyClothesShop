package com.fptu.project_group2.catalogstock.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class CatalogProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String categoryName;
    private String categorySlug;
    private String imageUrl;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private List<CatalogVariantResponse> variants;

    @Getter
    @Builder
    public static class CatalogVariantResponse {
        private UUID id;
        private String sku;
        private String color;
        private String size;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private long availableStock;
    }
}
