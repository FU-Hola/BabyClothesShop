package com.fptu.project_group2.ordermanagement.controllers;

import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.dto.response.OrderDetailResponse;
import com.fptu.project_group2.ordermanagement.dto.response.OrderSummaryResponse;
import com.fptu.project_group2.ordermanagement.services.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/orders")
public class CustomerOrderController {
    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderSummaryResponse>>> getMyOrders(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @RequestParam(required = false) OrderStatus status) {
        return ResponseBuilder.ok(
                orderService.getCustomerOrders(principal.id(), status),
                "Lấy danh sách đơn hàng thành công");
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getMyOrder(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable UUID id) {
        return ResponseBuilder.ok(orderService.getCustomerOrder(principal.id(), id));
    }

    @ExceptionHandler(BaseBusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BaseBusinessException exception) {
        return ResponseBuilder.error(
                exception.getHttpStatus(),
                exception.getErrorCode().getCode(),
                exception.getMessage(),
                exception.getDetails());
    }
}
