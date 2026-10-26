package com.fptu.project_group2.ordermanagement.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Fields needed by the staff order list and customer order history.
 */
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderSummaryResponse {

    private String id;
    private String orderCode;
    private Instant createdAt;
    private String receiverName;
    private String receiverPhone;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private Integer lineCount;
    private Integer totalQuantity;
    private String paymentStatus;
    private String status;
    private OrderPreviewItemResponse previewItem;
}
