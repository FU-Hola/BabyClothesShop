package com.fptu.project_group2.ordermanagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ShipOrderRequest {
    @NotBlank(message = "Vui lòng nhập đơn vị vận chuyển")
    @Size(max = 255)
    private String carrierName;

    @NotBlank(message = "Vui lòng nhập mã vận đơn")
    @Size(max = 100)
    private String trackingNumber;
}
