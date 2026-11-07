package com.fptu.project_group2.cartcheckout.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

@RestController
@PreAuthorize("hasRole('CUSTOMER')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/checkout")
public class CheckoutController {

    private final ICheckoutService checkoutService;

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<CheckoutValidationResponse>> validateCheckout(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CheckoutRequest request) {
        CheckoutValidationResponse response = checkoutService.validateCheckout(principal.id(), request);
        return ResponseBuilder.ok(response, "Kiểm tra thông tin đặt hàng thành công");
    }

    @PostMapping("/simulate-payment")
    public ResponseEntity<ApiResponse<OrderResultResponse>> simulatePayment(
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody SimulatePaymentRequest request) {
        OrderResultResponse response = checkoutService.simulatePayment(principal.id(), request);
        return ResponseBuilder.ok(response, response.getMessage());
    }
}
