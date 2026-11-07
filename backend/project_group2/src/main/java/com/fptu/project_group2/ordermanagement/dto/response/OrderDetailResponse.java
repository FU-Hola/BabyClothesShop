
package com.fptu.project_group2.ordermanagement.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import com.fptu.project_group2.ordermanagement.common.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class OrderDetailResponse {

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
    private String receiverAddress;
    private String customerNote;
    private PaymentMethod paymentMethod;
    @Builder.Default
    private List<OrderItemResponse> items = List.of();
    private Instant confirmedAt;
    private Instant deliveredAt;
    private Instant paidAt;
}
