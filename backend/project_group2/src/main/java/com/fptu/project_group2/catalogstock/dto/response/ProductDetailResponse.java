package com.fptu.project_group2.catalogstock.dto.response;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ProductDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private UUID categoryId;
    private String categoryName;
    private ProductStatus status;
    private Instant createdAt;
    private List<VariantResponse> variants;

    @Getter
    @Builder
    public static class VariantResponse {
        private UUID id;
        private String sku;
        private String color;
        private String size;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private boolean active;
    }
}