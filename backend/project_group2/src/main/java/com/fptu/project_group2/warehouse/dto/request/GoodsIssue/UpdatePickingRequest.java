package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;
import java.util.UUID;
import jakarta.validation.Valid;
import java.util.List;

public record UpdatePickingRequest(
        @NotNull @PositiveOrZero Long version,
        @NotEmpty @Size(max = 200) List<@NotNull @Valid Line> items
) {
    public record Line(
            @NotNull UUID issueItemId,
            @NotNull @PositiveOrZero Integer pickedQuantity
    ) {}
}
