package com.fptu.project_group2.warehouse.dto.request.GoodsIssue;

import jakarta.validation.constraints.*;

public record CancelIssueRequest(
        @NotNull @PositiveOrZero Long version,
        @NotBlank @Size(max = 1000) String reason,
        @NotNull @AssertTrue(message = "Cần xác nhận đã kiểm tra và thu hồi hàng đang soạn") Boolean stockRecovered
) {}
