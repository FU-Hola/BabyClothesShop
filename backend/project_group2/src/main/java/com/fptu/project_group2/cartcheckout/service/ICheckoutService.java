package com.fptu.project_group2.cartcheckout.service;

import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;

import java.util.UUID;

public interface ICheckoutService {

    /**
     * Tạo checkout bất biến và giữ đủ tồn trong cùng transaction.
     */
    CheckoutValidationResponse validateCheckout(UUID customerId, CheckoutRequest request);

    /**
     * Xử lý kết quả thanh toán mô phỏng (Thành công / Thất bại) (UC12)
     */
    OrderResultResponse simulatePayment(UUID customerId, SimulatePaymentRequest request);
    OrderResultResponse cancelCheckout(UUID customerId, String checkoutKey);

    OrderResultResponse getCheckout(UUID customerId, String checkoutKey);
}

