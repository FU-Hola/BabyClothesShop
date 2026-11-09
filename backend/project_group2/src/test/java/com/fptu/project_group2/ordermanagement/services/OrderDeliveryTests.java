package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import com.fptu.project_group2.warehouse.service.IGoodsIssue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderDeliveryTests {
    @Mock
    private OrderRepository orders;
    @Mock
    private GoodsIssueRepository issues;
    @Mock
    private InventoryRepository inventory;
    @Mock
    private IGoodsIssue goodsIssue;
    @Spy
    private OrderResponseMapper mapper = new OrderResponseMapper();
    @InjectMocks
    private OrderService service;

    @Test
    void deliversShippingOrderWithoutUpdatingStockOrIssue() {
        Order order = order(OrderStatus.SHIPPING);
        Instant before = Instant.now();

        var result = service.deliverOrder(order.getId());

        assertEquals("DELIVERED", result.getStatus());
        assertNotNull(result.getDeliveredAt());
        assertFalse(result.getDeliveredAt().isBefore(before));
        assertFalse(result.getDeliveredAt().isAfter(Instant.now()));
        assertNull(order.getDeliveredBy());
        verify(orders).saveAndFlush(order);
        verifyNoInteractions(issues, inventory);
    }

    @Test
    void rejectsEveryNonShippingStatusWithoutSaving() {
        for (OrderStatus status : List.of(OrderStatus.PENDING_CONFIRMATION, OrderStatus.CONFIRMED,
                OrderStatus.PACKED, OrderStatus.DELIVERED)) {
            Order order = order(status);

            assertThrows(OrderConflictException.class, () -> service.deliverOrder(order.getId()));
            assertEquals(status, order.getStatus());
            assertNull(order.getDeliveredAt());
        }
        verify(orders, never()).saveAndFlush(any());
        verifyNoInteractions(issues, inventory);
    }

    @Test
    void repeatedDeliveryPreservesFirstTimestamp() {
        Order order = order(OrderStatus.SHIPPING);
        service.deliverOrder(order.getId());
        Instant deliveredAt = order.getDeliveredAt();

        assertThrows(OrderConflictException.class, () -> service.deliverOrder(order.getId()));

        assertEquals(deliveredAt, order.getDeliveredAt());
        verify(orders, times(1)).saveAndFlush(order);
        verifyNoInteractions(issues, inventory);
    }

    @Test
    void missingOrderDoesNotSaveOrUpdateStock() {
        UUID id = UUID.randomUUID();
        when(orders.findWithItemsById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.deliverOrder(id));

        verify(orders, never()).saveAndFlush(any());
        verifyNoInteractions(issues, inventory);
    }

    private Order order(OrderStatus status) {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        order.setStatus(status);
        when(orders.findWithItemsById(order.getId())).thenReturn(Optional.of(order));
        return order;
    }
}
