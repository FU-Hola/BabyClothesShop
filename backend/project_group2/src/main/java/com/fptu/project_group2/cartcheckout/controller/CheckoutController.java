package com.fptu.project_group2.cartcheckout.controller;

import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;
import com.fptu.project_group2.cartcheckout.service.ICheckoutService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    private final ICheckoutService checkoutService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CheckoutValidationResponse>> validateCheckout(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId,
            @Valid @RequestBody CheckoutRequest request) {
        CheckoutValidationResponse response = checkoutService.validateCheckout(customerId, request);
        return ResponseBuilder.ok(response, "Kiểm tra thông tin đặt hàng thành công");
    }

    @PostMapping("/simulate-payment")
    public ResponseEntity<ApiResponse<OrderResultResponse>> simulatePayment(
            @RequestHeader(value = "X-User-Id", required = false) UUID customerId,
            @Valid @RequestBody SimulatePaymentRequest request) {
        OrderResultResponse response = checkoutService.simulatePayment(customerId, request);
        return ResponseBuilder.ok(response, response.getMessage());
    }
}
