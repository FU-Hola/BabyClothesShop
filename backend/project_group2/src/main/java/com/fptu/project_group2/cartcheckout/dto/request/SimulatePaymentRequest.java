package com.fptu.project_group2.cartcheckout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimulatePaymentRequest {
    @NotBlank(message = "Mã phiên checkout (checkoutKey) không được để trống")
    private String checkoutKey;

    @NotNull(message = "Kết quả thanh toán mô phỏng không được để trống")
    private Boolean isSuccess;

    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;
    private String customerNote;
}
