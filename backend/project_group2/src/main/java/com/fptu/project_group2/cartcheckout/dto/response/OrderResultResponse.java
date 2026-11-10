package com.fptu.project_group2.cartcheckout.dto.response;

import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResultResponse {
    private boolean success;
    private UUID orderId;
    private String orderCode;
    private String checkoutKey;
    private java.time.Instant paymentExpiresAt;
    private OrderStatus orderStatus;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private Instant createdAt;
    private Instant serverTime;
    private String message;
}

