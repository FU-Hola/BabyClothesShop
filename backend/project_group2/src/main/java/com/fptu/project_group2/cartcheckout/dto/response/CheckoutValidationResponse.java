package com.fptu.project_group2.cartcheckout.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutValidationResponse {
    private boolean isValid;
    private String checkoutKey;
    private java.util.UUID orderId;
    private String orderCode;
    private java.time.Instant paymentExpiresAt;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String customerNote;
    private int totalItems;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal totalAmount;
    private List<StockCheckItemResponse> outOfStockItems;
}

