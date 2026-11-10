package com.fptu.project_group2.cartcheckout.service;

import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;

import java.util.UUID;

public interface ICheckoutService {

    CheckoutValidationResponse validateCheckout(UUID customerId, CheckoutRequest request);

    OrderResultResponse simulatePayment(UUID customerId, SimulatePaymentRequest request);
    OrderResultResponse cancelCheckout(UUID customerId, String checkoutKey);

    OrderResultResponse getCheckout(UUID customerId, String checkoutKey);
}

