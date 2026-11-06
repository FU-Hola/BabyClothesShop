package com.fptu.project_group2.ordermanagement.services;

import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.dto.response.OrderDetailResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderSummaryResponse;
import com.fptu.project_group2.ordermanagement.entity.Order;
import com.fptu.project_group2.ordermanagement.mapper.OrderResponseMapper;
import com.fptu.project_group2.ordermanagement.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
}
