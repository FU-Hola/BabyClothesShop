package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repositories.OrderRepository;
import com.fptu.project_group2.warehouse.repository.GoodsIssueRepository;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.dao.OptimisticLockingFailureException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OrderServiceTests {
    private final OrderRepository repository = mock(OrderRepository.class);
    private final OrderService service = new OrderService(repository, new OrderResponseMapper(),
            mock(GoodsIssueRepository.class), mock(InventoryRepository.class));

    @Test
    void listsOrdersInPageOrderAndTrimsSearch() {
        Order first = order();
        Order second = order();
        List<UUID> ids = List.of(first.getId(), second.getId());
        when(repository.findPageIds(eq(OrderStatus.CONFIRMED), eq("ORD"), any(Pageable.class)))
                .thenAnswer(call -> new PageImpl<>(ids, call.getArgument(2), 5));
        when(repository.findAllWithItemsByIdIn(ids)).thenReturn(List.of(second, first));

        var result = service.getOrders(OrderStatus.CONFIRMED, " ORD ", 1, 2);

        assertEquals(first.getId().toString(), result.getItems().get(0).getId());
        assertEquals(second.getId().toString(), result.getItems().get(1).getId());
        assertEquals(5, result.getTotalItems());
        assertEquals(3, result.getTotalPages());
        assertEquals(0, result.getPage());
        assertTrue(result.isHasNext());
    }

    @Test
    void skipsItemQueryForEmptyPage() {
        when(repository.findPageIds(isNull(), eq(""), any(Pageable.class)))
                .thenAnswer(call -> new PageImpl<UUID>(List.of(), call.getArgument(2), 0));

        assertTrue(service.getOrders(null, null, 1, 10).getItems().isEmpty());
        verify(repository, never()).findAllWithItemsByIdIn(anyList());
    }

    @Test
    void rejectsInvalidPaginationBeforeQuerying() {
        assertThrows(BadRequestException.class, () -> service.getOrders(null, "", 0, 10));
        assertThrows(BadRequestException.class, () -> service.getOrders(null, "", 1, 0));
        assertThrows(BadRequestException.class, () -> service.getOrders(null, "", 1, 101));
        verifyNoInteractions(repository);
    }

    @Test
    void returnsDetail() {
        Order order = order();
        when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));

        assertEquals(order.getId().toString(), service.getOrderDetail(order.getId()).getId());
    }

    @Test
    void reportsMissingOrder() {
        UUID id = UUID.randomUUID();
        when(repository.findWithItemsById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getOrderDetail(id));
    }

    @Test
    void confirmsPaidPendingOrderAndRecordsTime() {
        Order order = order();
        order.setPaymentStatus(PaymentStatus.PAID);
        when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));
        Instant before = Instant.now();

        var result = service.confirmOrder(order.getId());

        assertEquals("CONFIRMED", result.getStatus());
        assertEquals(PaymentStatus.PAID, order.getPaymentStatus());
        assertNotNull(result.getConfirmedAt());
        assertFalse(result.getConfirmedAt().isBefore(before));
        assertFalse(result.getConfirmedAt().isAfter(Instant.now()));
        assertNull(order.getConfirmedBy());
        verify(repository).saveAndFlush(order);
    }

    @Test
    void rejectsUnpaidOrderWithoutChangingIt() {
        Order order = order();
        when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));

        assertThrows(OrderConflictException.class, () -> service.confirmOrder(order.getId()));

        assertEquals(OrderStatus.PENDING_CONFIRMATION, order.getStatus());
        assertNull(order.getConfirmedAt());
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsEveryNonPendingStatus() {
        for (OrderStatus status : List.of(OrderStatus.CONFIRMED, OrderStatus.PACKED,
                OrderStatus.SHIPPING, OrderStatus.DELIVERED)) {
            Order order = order();
            order.setStatus(status);
            order.setPaymentStatus(PaymentStatus.PAID);
            when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));

            assertThrows(OrderConflictException.class, () -> service.confirmOrder(order.getId()));
            assertEquals(status, order.getStatus());
            assertNull(order.getConfirmedAt());
        }
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void rejectsRepeatedConfirmationAndPreservesFirstTimestamp() {
        Order order = order();
        order.setPaymentStatus(PaymentStatus.PAID);
        when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));
        service.confirmOrder(order.getId());
        Instant confirmedAt = order.getConfirmedAt();

        assertThrows(OrderConflictException.class, () -> service.confirmOrder(order.getId()));

        assertEquals(confirmedAt, order.getConfirmedAt());
        verify(repository, times(1)).saveAndFlush(order);
    }

    @Test
    void reportsMissingOrderWhenConfirming() {
        UUID id = UUID.randomUUID();
        when(repository.findWithItemsById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.confirmOrder(id));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test
    void propagatesConcurrentUpdateFailureInsteadOfReturningSuccess() {
        Order order = order();
        order.setPaymentStatus(PaymentStatus.PAID);
        when(repository.findWithItemsById(order.getId())).thenReturn(Optional.of(order));
        when(repository.saveAndFlush(order))
                .thenThrow(new OptimisticLockingFailureException("Concurrent update"));

        assertThrows(OptimisticLockingFailureException.class,
                () -> service.confirmOrder(order.getId()));
    }

    private Order order() {
        Order order = new Order();
        order.setId(UUID.randomUUID());
        return order;
    }
}
