package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.dto.request.ShipOrderRequest;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.entity.OrderItem;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repositories.OrderRepository;
import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class OrderShippingTests {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final GoodsIssueRepository issues = mock(GoodsIssueRepository.class);
    private final InventoryRepository inventory = mock(InventoryRepository.class);
    private final OrderService service = new OrderService(orders, new OrderResponseMapper(), issues, inventory);

    @Test
    void shipsPackedOrderOnceAndRecordsCarrier() {
        Order order = packedOrder();
        GoodsIssue issue = packedIssue(order);
        when(inventory.decreaseStock(any(), eq(2L))).thenReturn(1);

        var result = service.shipOrder(order.getId(), request());

        assertEquals("SHIPPING", result.getStatus());
        assertEquals(GoodsIssueStatus.EXPORTED, issue.getStatus());
        assertEquals("Demo Carrier", issue.getCarrierName());
        assertEquals("TRACK-001", issue.getTrackingNumber());
        assertNotNull(issue.getExportedAt());
        assertNull(issue.getExportedBy());
        verify(inventory).decreaseStock(order.getItems().get(0).getVariant().getId(), 2L);
        verify(issues).saveAndFlush(issue);
        verify(orders).saveAndFlush(order);

        assertThrows(OrderConflictException.class, () -> service.shipOrder(order.getId(), request()));
        verify(inventory, times(1)).decreaseStock(any(), anyLong());
    }

    @Test
    void rejectsMissingOrder() {
        UUID id = UUID.randomUUID();
        when(orders.findWithItemsById(id)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> service.shipOrder(id, request()));
        verifyNoInteractions(issues, inventory);
    }

    @Test
    void rejectsEveryNonPackedOrderStatus() {
        for (OrderStatus status : List.of(OrderStatus.PENDING_CONFIRMATION, OrderStatus.CONFIRMED,
                OrderStatus.SHIPPING, OrderStatus.DELIVERED)) {
            Order order = packedOrder();
            order.setStatus(status);
            assertThrows(OrderConflictException.class, () -> service.shipOrder(order.getId(), request()));
        }
        verifyNoInteractions(issues, inventory);
    }

    @Test
    void rejectsMissingIssue() {
        Order order = packedOrder();
        when(issues.findByOrderId(order.getId())).thenReturn(Optional.empty());
        assertThrows(OrderConflictException.class, () -> service.shipOrder(order.getId(), request()));
        verifyNoInteractions(inventory);
    }

    @Test
    void rejectsNonPackedIssue() {
        Order order = packedOrder();
        GoodsIssue issue = packedIssue(order);
        for (GoodsIssueStatus status : List.of(GoodsIssueStatus.PENDING, GoodsIssueStatus.PICKING,
                GoodsIssueStatus.EXPORTED)) {
            issue.setStatus(status);
            assertThrows(OrderConflictException.class, () -> service.shipOrder(order.getId(), request()));
        }
        verifyNoInteractions(inventory);
    }

    @Test
    void rejectsInsufficientStockWithoutChangingStatuses() {
        Order order = packedOrder();
        GoodsIssue issue = packedIssue(order);
        when(inventory.decreaseStock(any(), anyLong())).thenReturn(0);
        assertThrows(OrderConflictException.class, () -> service.shipOrder(order.getId(), request()));
        assertEquals(OrderStatus.PACKED, order.getStatus());
        assertEquals(GoodsIssueStatus.PACKED, issue.getStatus());
        assertNull(issue.getExportedAt());
        verify(orders, never()).saveAndFlush(any());
        verify(issues, never()).saveAndFlush(any());
    }

    private Order packedOrder() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setStatus(OrderStatus.PACKED);
        ProductVariant variant = new ProductVariant();
        variant.setId(UUID.randomUUID());
        OrderItem item = new OrderItem();
        item.setId(UUID.randomUUID());
        item.setVariant(variant);
        item.setQuantity(2);
        item.setUnitPrice(BigDecimal.TEN);
        order.addOrderItem(item);
        when(orders.findWithItemsById(order.getId())).thenReturn(Optional.of(order));
        return order;
    }

    private GoodsIssue packedIssue(Order order) {
        GoodsIssue issue = new GoodsIssue();
        issue.setOrder(order);
        issue.setStatus(GoodsIssueStatus.PACKED);
        when(issues.findByOrderId(order.getId())).thenReturn(Optional.of(issue));
        return issue;
    }

    private ShipOrderRequest request() {
        ShipOrderRequest request = new ShipOrderRequest();
        request.setCarrierName(" Demo Carrier ");
        request.setTrackingNumber(" TRACK-001 ");
        return request;
    }
}
