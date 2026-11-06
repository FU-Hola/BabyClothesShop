package com.fptu.project_group2.cartcheckout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockCheckItemResponse {
    private UUID variantId;
    private String productName;
    private String size;
    private String color;
    private int requestedQuantity;
    private long availableStock;
    private boolean isAvailable;
    private String message;
}

