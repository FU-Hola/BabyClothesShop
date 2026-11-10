package com.fptu.project_group2.cartcheckout.controller;

import com.fptu.project_group2.cartcheckout.service.ICheckoutService;
import com.fptu.project_group2.common.service.RequestIdempotency;
import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;
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
    private final RequestIdempotency idempotency;

    @PostMapping({"/validate", "/orders"})
    public ResponseEntity<String> validateCheckout(
            @RequestHeader("Idempotency-Key") String key,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody CheckoutRequest request) {
        return idempotency.execute(key,"checkout:create",request,
                () -> ResponseBuilder.ok(checkoutService.validateCheckout(principal.id(),request),"Đã giữ hàng cho đơn"));
    }

    @PostMapping("/simulate-payment")
    public ResponseEntity<String> simulatePayment(
            @RequestHeader("Idempotency-Key") String key,
            @AuthenticationPrincipal AuthenticatedUser principal,
            @Valid @RequestBody SimulatePaymentRequest request) {
        return idempotency.execute(key,"checkout:payment:"+request.getCheckoutKey(),request,
                () -> ResponseBuilder.ok(checkoutService.simulatePayment(principal.id(),request)));
    }

    @PostMapping("/{checkoutKey}/cancel")
    public ResponseEntity<String> cancel(@AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable String checkoutKey,@RequestHeader("Idempotency-Key") String key) {
        return idempotency.execute(key,"checkout:cancel:"+checkoutKey,checkoutKey,
                () -> ResponseBuilder.ok(checkoutService.cancelCheckout(principal.id(),checkoutKey)));
    }

    @GetMapping("/{checkoutKey}")
    public ResponseEntity<ApiResponse<OrderResultResponse>> detail(@AuthenticationPrincipal AuthenticatedUser principal,
            @PathVariable String checkoutKey) {
        return ResponseBuilder.ok(checkoutService.getCheckout(principal.id(),checkoutKey));
    }
}
