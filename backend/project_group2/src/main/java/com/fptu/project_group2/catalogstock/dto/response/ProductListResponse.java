package com.fptu.project_group2.catalogstock.dto.response;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@AllArgsConstructor
@Builder
public class ProductListResponse {
    private UUID id;
    private String name;
    private UUID categoryId;
    private String categoryName;
    private ProductStatus status;
    private Instant createdAt;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

}
