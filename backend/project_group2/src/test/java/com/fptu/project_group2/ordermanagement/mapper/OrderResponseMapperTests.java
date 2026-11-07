package com.fptu.project_group2.ordermanagement.mapper;

import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class OrderResponseMapperTests {
    private final OrderResponseMapper mapper = new OrderResponseMapper();

    @Test
    void mapsDetailWithSnapshotItemsTotalsAndDates() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setOrderCode("ORD-001");
        order.setCreatedAt(Instant.parse("2026-10-01T00:00:00Z"));
        order.setReceiverName("Nguyen Van A");
        order.setReceiverPhone("0901234567");
        order.setReceiverAddress("Ha Noi");
        order.setCustomerNote("Giao buoi sang");
        order.setShippingFee(new BigDecimal("30000.00"));
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setPaidAt(order.getCreatedAt());
        order.setConfirmedAt(order.getCreatedAt().plusSeconds(60));
        order.setDeliveredAt(order.getCreatedAt().plusSeconds(3600));
        order.addOrderItem(item("Ao em be", 2, "100000.00"));
        order.addOrderItem(item("Quan em be", 1, "50000.00"));

        var detail = mapper.toDetail(order);
        var summary = mapper.toSummary(order);

        assertEquals(order.getId().toString(), detail.getId());
        assertEquals(order.getOrderCode(), detail.getOrderCode());
        assertEquals(order.getCreatedAt(), detail.getCreatedAt());
        assertEquals(order.getReceiverName(), detail.getReceiverName());
        assertEquals(order.getReceiverPhone(), detail.getReceiverPhone());
        assertEquals(order.getReceiverAddress(), detail.getReceiverAddress());
        assertEquals(order.getCustomerNote(), detail.getCustomerNote());
        assertEquals(new BigDecimal("280000.00"), detail.getTotalAmount());
        assertEquals(summary.getTotalAmount(), detail.getTotalAmount());
        assertEquals(order.getShippingFee(), detail.getShippingFee());
        assertEquals(2, detail.getLineCount());
        assertEquals(3, detail.getTotalQuantity());
        assertEquals("PAID", detail.getPaymentStatus());
        assertEquals(order.getStatus().name(), detail.getStatus());
        assertEquals(order.getPaymentMethod(), detail.getPaymentMethod());
        assertEquals(order.getPaidAt(), detail.getPaidAt());
        assertEquals(order.getConfirmedAt(), detail.getConfirmedAt());
        assertEquals(order.getDeliveredAt(), detail.getDeliveredAt());
        assertEquals(summary.getPreviewItem(), detail.getPreviewItem());
        assertEquals("Ao em be", detail.getPreviewItem().getProductName());
        assertEquals(2, detail.getItems().size());
        assertEquals("Ao em be", detail.getItems().get(0).getProductNameSnapshot());
        assertEquals("SKU-001", detail.getItems().get(0).getSkuSnapshot());
        assertEquals("Blue", detail.getItems().get(0).getColorSnapshot());
        assertEquals("S", detail.getItems().get(0).getSizeSnapshot());
        assertEquals("/snapshot.png", detail.getItems().get(0).getImageUrlSnapshot());
        assertEquals(order.getItems().get(0).getId().toString(), detail.getItems().get(0).getId());
        assertEquals(2, detail.getItems().get(0).getQuantity());
        assertEquals(new BigDecimal("100000.00"), detail.getItems().get(0).getUnitPrice());
    }

    @Test
    void mapsEmptyItemsAndOptionalFields() {
        Order order = new Order();
        order.setId(UUID.randomUUID());

        var detail = mapper.toDetail(order);

        assertEquals(BigDecimal.ZERO, detail.getTotalAmount());
        assertEquals(0, detail.getLineCount());
        assertEquals(0, detail.getTotalQuantity());
        assertTrue(detail.getItems().isEmpty());
        assertNull(detail.getPreviewItem());
        assertNull(detail.getCustomerNote());
        assertNull(detail.getPaidAt());
        assertNull(detail.getConfirmedAt());
        assertNull(detail.getDeliveredAt());
    }

    private OrderItem item(String name, int quantity, String price) {
        OrderItem item = new OrderItem();
        item.setId(UUID.randomUUID());
        item.setProductNameSnapshot(name);
        item.setSkuSnapshot("SKU-001");
        item.setColorSnapshot("Blue");
        item.setSizeSnapshot("S");
        item.setImageUrlSnapshot("/snapshot.png");
        item.setQuantity(quantity);
        item.setUnitPrice(new BigDecimal(price));
        return item;
    }
}
