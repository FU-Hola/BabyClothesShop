package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.security.CurrentActorProvider;
import com.fptu.project_group2.warehouse.service.InventoryReservationService;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.common.PaymentStatus;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CreateGoodsIssueRequest;
import com.fptu.project_group2.ordermanagement.dto.response.OrderDetailResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderSummaryResponse;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repository.OrderRepository;
import com.fptu.project_group2.warehouse.service.IGoodsIssue;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderService {
    private final OrderRepository orderRepository;
    private final OrderResponseMapper orderMapper;
    private final IGoodsIssue goodsIssue;
    private final InventoryReservationService reservations;
    private final CurrentActorProvider actors;

    public PageResponse<OrderSummaryResponse> getOrders(OrderStatus status, String search,
                                                       int page, int size) {
        if (page < 1 || size < 1 || size > 100) {
            throw new BadRequestException("Trang phải từ 1, kích thước trang từ 1 đến 100");
        }

        String keyword = search == null ? "" : search.trim();
        Pageable pageable = PageRequest.of(page - 1, size,
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        Page<UUID> idPage = orderRepository.findPageIds(status, keyword, pageable);
        List<OrderSummaryResponse> items = new ArrayList<>();

        if (idPage.hasContent()) {
            List<Order> orders = orderRepository.findAllWithItemsByIdIn(idPage.getContent());
            Map<UUID, Order> ordersById = new HashMap<>();
            for (Order order : orders) {
                ordersById.put(order.getId(), order);
            }

            // SQL IN does not preserve the order of the paginated IDs.
            for (UUID id : idPage.getContent()) {
                Order order = ordersById.get(id);
                if (order != null) {
                    items.add(orderMapper.toSummary(order));
                }
            }
        }

        Page<OrderSummaryResponse> result = new PageImpl<>(items, pageable, idPage.getTotalElements());
        // PageResponse uses zero-based page numbers, like Spring Data.
        return PageResponse.of(result);
    }

    public OrderDetailResponse getOrderDetail(UUID id) {
        Order order = orderRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Order", "id", id));
        return orderMapper.toDetail(order);
    }

    public List<OrderSummaryResponse> getCustomerOrders(UUID customerId, OrderStatus status) {
        List<Order> matched = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .filter(order -> status == null || order.getStatus() == status)
                .toList();
        if (matched.isEmpty()) {
            return List.of();
        }

        Map<UUID, Order> ordersById = new HashMap<>();
        List<UUID> ids = matched.stream().map(Order::getId).toList();
        for (Order order : orderRepository.findAllWithItemsByIdIn(ids)) {
            ordersById.put(order.getId(), order);
        }

        List<OrderSummaryResponse> items = new ArrayList<>();
        for (Order order : matched) {
            Order loaded = ordersById.get(order.getId());
            if (loaded != null) {
                items.add(orderMapper.toSummary(loaded));
            }
        }
        return items;
    }

    public OrderDetailResponse getCustomerOrder(UUID customerId, UUID orderId) {
        Order order = orderRepository.findWithItemsById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đơn hàng"));
        if (order.getCustomer() == null || !customerId.equals(order.getCustomer().getId())) {
            throw new BaseBusinessException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền xem đơn hàng này");
        }
        return orderMapper.toDetail(order);
    }

    @Transactional
    public OrderDetailResponse confirmOrder(UUID id) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Order", "id", id));

        if (order.getStatus() != OrderStatus.PENDING_CONFIRMATION) {
            throw new OrderConflictException("Chỉ được xác nhận đơn đang chờ xác nhận");
        }
        if (order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new OrderConflictException("Đơn hàng chưa thanh toán thành công");
        }

        reservations.requireCommitted(order);
        order.setConfirmedBy(actors.currentActor());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setConfirmedAt(Instant.now());

        // Flush now so @Version detects concurrent changes before returning the result.
        orderRepository.saveAndFlush(order);
        goodsIssue.createGoodsIssue(new CreateGoodsIssueRequest(order.getId()));
        return orderMapper.toDetail(order);
    }

    @Transactional
    public OrderDetailResponse deliverOrder(UUID id) {
        Order order = orderRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new NotFoundException("Order", "id", id));
        if (order.getStatus() != OrderStatus.SHIPPING) {
            throw new OrderConflictException("Chỉ được xác nhận giao thành công cho đơn đang giao");
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(Instant.now());
        order.setDeliveredBy(actors.currentActor());
        orderRepository.saveAndFlush(order);
        return orderMapper.toDetail(order);
    }

}
