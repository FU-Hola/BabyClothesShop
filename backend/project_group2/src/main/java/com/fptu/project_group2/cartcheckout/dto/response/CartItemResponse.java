package com.fptu.project_group2.cartcheckout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private UUID variantId;
    private UUID productId;
    private String productName;
    private String sku;
    private String color;
    private String size;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String imageUrl;
    private Integer quantity;
    private Long availableStock;
    private BigDecimal subtotal;
}

