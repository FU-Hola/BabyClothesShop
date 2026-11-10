package com.fptu.project_group2.cartcheckout.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.PositiveOrZero
    private Long cartRevision;

    @NotBlank(message = "Họ tên người nhận không được để trống")
    @Size(max = 255, message = "Họ tên người nhận tối đa 255 ký tự")
    private String receiverName;

    @NotBlank(message = "Số điện thoại người nhận không được để trống")
    @Pattern(regexp = "^(0|\\+84)[35789][0-9]{8}$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String receiverPhone;

    @NotBlank(message = "Địa chỉ nhận hàng không được để trống")
    @Size(max = 1000, message = "Địa chỉ nhận hàng tối đa 1000 ký tự")
    private String receiverAddress;

    @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự")
    private String customerNote;
}

