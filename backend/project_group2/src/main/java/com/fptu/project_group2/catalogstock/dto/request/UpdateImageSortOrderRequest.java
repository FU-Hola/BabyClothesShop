package com.fptu.project_group2.catalogstock.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateImageSortOrderRequest(@NotNull @Min(0) Integer sortOrder) {
}
