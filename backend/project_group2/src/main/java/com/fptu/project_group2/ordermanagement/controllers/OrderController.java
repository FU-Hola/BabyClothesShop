package com.fptu.project_group2.ordermanagement.controllers;

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
import com.fptu.project_group2.ordermanagement.dto.request.ShipOrderRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-staff/orders")
public class OrderController {
    private final OrderService orderService;

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
    public ResponseEntity<ApiResponse<OrderDetailResponse>> confirmOrder(@PathVariable UUID id) {
        return ResponseBuilder.ok(orderService.confirmOrder(id), "Xác nhận đơn hàng thành công");
    }

    @ExceptionHandler(OrderConflictException.class)
    public ResponseEntity<ApiResponse<Void>> handleOrderConflict(OrderConflictException exception) {
        return ResponseBuilder.conflict(exception.getMessage());
    }

    @PatchMapping("/{id}/ship")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> shipOrder(
            @PathVariable UUID id, @Valid @RequestBody ShipOrderRequest request) {
        return ResponseBuilder.ok(orderService.shipOrder(id, request), "Ghi nhận gửi hàng thành công");
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
