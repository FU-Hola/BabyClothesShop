package com.fptu.project_group2.ordermanagement.controllers;

import com.fptu.project_group2.common.service.RequestIdempotency;
import com.fptu.project_group2.common.exception.BadRequestException;
import com.fptu.project_group2.common.exception.NotFoundException;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.OrderConflictException;
import com.fptu.project_group2.ordermanagement.dto.response.OrderDetailResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderSummaryResponse;
import com.fptu.project_group2.ordermanagement.services.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@PreAuthorize("hasRole('STORE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-staff/orders")
public class OrderController {
    private final OrderService orderService;
    private final RequestIdempotency idempotency;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderSummaryResponse>>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseBuilder.ok(orderService.getOrders(status, search, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(@PathVariable UUID id) {
        return ResponseBuilder.ok(orderService.getOrderDetail(id));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<String> confirmOrder(@PathVariable UUID id,@RequestHeader("Idempotency-Key") String key) {
        return idempotency.execute(key,"order:confirm:"+id,id,
                () -> ResponseBuilder.ok(orderService.confirmOrder(id), "Xác nhận đơn hàng thành công"));
    }

    @PatchMapping("/{id}/deliver")
    public ResponseEntity<String> deliverOrder(@PathVariable UUID id,@RequestHeader("Idempotency-Key") String key) {
        return idempotency.execute(key,"order:deliver:"+id,id,
                () -> ResponseBuilder.ok(orderService.deliverOrder(id), "Xác nhận giao hàng thành công"));
    }

    @ExceptionHandler(OrderConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleOrderConflict(OrderConflictException exception) {
        return ResponseBuilder.conflict(exception.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException exception) {
        return ResponseBuilder.notFound(exception.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(BadRequestException exception) {
        return ResponseBuilder.badRequest(exception.getMessage());
    }
}
