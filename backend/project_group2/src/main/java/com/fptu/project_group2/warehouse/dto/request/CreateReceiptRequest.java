package com.fptu.project_group2.warehouse.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CreateReceiptRequest(
        @NotBlank @Size(message = "Độ dài kí tự không được 255 kí tự",max = 255) String supplierName,
        @NotNull LocalDate expectedDate,
        @Size(max = 1000, message = "Độ dài ghi chú không được lớn hơn 1000 ký tự") String note,
        @NotEmpty @Size(max = 200) List<@NotNull @Valid Line> items
) {

    public record Line(@NotNull UUID variantId,
                       @NotNull @Positive(message = "Số lượng nhập không được < 0") Integer expectedQuantity) {}
}
