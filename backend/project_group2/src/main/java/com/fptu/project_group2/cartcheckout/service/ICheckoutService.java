package com.fptu.project_group2.cartcheckout.service;

import com.fptu.project_group2.cartcheckout.dto.request.CheckoutRequest;
import com.fptu.project_group2.cartcheckout.dto.request.SimulatePaymentRequest;
import com.fptu.project_group2.cartcheckout.dto.response.CheckoutValidationResponse;
import com.fptu.project_group2.cartcheckout.dto.response.OrderResultResponse;

import java.util.UUID;

public interface ICheckoutService {

    /**
     * Kiểm tra tồn kho & thông tin trước khi chuyển sang bước thanh toán mô phỏng (UC12)
     */
    CheckoutValidationResponse validateCheckout(UUID customerId, CheckoutRequest request);

    /**
     * Xử lý kết quả thanh toán mô phỏng (Thành công / Thất bại) (UC12)
     */
    OrderResultResponse simulatePayment(UUID customerId, SimulatePaymentRequest request);
}

