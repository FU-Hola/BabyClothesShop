package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderDeliveryTests {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final GoodsIssueRepository issues = mock(GoodsIssueRepository.class);
    private final InventoryRepository inventory = mock(InventoryRepository.class);
    private final OrderService service = new OrderService(orders, new OrderResponseMapper(), issues, inventory);

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
