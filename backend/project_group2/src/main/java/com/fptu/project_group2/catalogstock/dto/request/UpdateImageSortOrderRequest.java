package com.fptu.project_group2.catalogstock.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateImageSortOrderRequest(
        @NotNull(message = "Thứ tự ảnh không được để trống")
        @Min(value = 0, message = "Thứ tự ảnh không được âm")
        Integer sortOrder
) {
}
