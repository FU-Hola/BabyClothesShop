
package com.fptu.project_group2.ordermanagement.mapper;

import java.math.BigDecimal;

import com.fptu.project_group2.ordermanagement.dto.response.OrderItemResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderPreviewItemResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderSummaryResponse;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;

/**
 * OrderResponseMapper
 */
public class OrderResponseMapper {

    public OrderItemResponse toItem(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId().toString())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .productNameSnapshot(item.getProductNameSnapshot())
                .skuSnapshot(item.getSkuSnapshot())
                .colorSnapshot(item.getColorSnapshot())
                .sizeSnapshot(item.getSizeSnapshot())
                .imageUrlSnapshot(item.getImageUrlSnapshot())
                .build();
    }

    public OrderSummaryResponse toSummary(Order order) {

        var items = order.getItems();

        BigDecimal subTotal = BigDecimal.ZERO;

        for (OrderItem item : order.getItems()) {
            BigDecimal unitPrice = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            subTotal = subTotal.add(unitPrice);

        }
        BigDecimal totalaMount = subTotal.add(order.getShippingFee());

        int totalQuantity = 0;
        for (OrderItem item : items) {
            totalQuantity += item.getQuantity();
        }

        OrderPreviewItemResponse previewItem = null;

        if (!items.isEmpty()) {
            OrderItem firstItem = items.get(0);
            previewItem = toPreview(firstItem);
        }

        return OrderSummaryResponse.builder()
                .id(order.getId().toString())
                .orderCode(order.getOrderCode())
                .createdAt(order.getCreatedAt())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .shippingFee(order.getShippingFee())
                .totalAmount(totalaMount)
                .lineCount(items.size())
                .totalQuantity(totalQuantity)
                .paymentStatus(order.getPaymentStatus().name())
                .status(order.getStatus().name())
                .previewItem(previewItem)
                .build();
    }

    private OrderPreviewItemResponse toPreview(OrderItem item) {
        return OrderPreviewItemResponse.builder()
                .productName(item.getProductNameSnapshot())
                .color(item.getColorSnapshot())
                .size(item.getSizeSnapshot())
                .quantity(item.getQuantity())
                .imageUrl(item.getImageUrlSnapshot())
                .build();
    }
}
