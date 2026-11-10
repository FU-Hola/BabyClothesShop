package com.fptu.project_group2.cartcheckout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private UUID cartId;
    private long revision;
    private String activeCheckoutKey;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalPrice;
}

