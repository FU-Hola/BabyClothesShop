package com.fptu.project_group2.authaccount.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AccountSearchRequest(
        @Size(max = 255) String search,
        @Pattern(regexp = "all|active|blocked|deleted", message = "Bộ lọc trạng thái không hợp lệ") String status,
        @Min(1) Integer page,
        @Min(1) @Max(50) Integer pageSize
) {
    public AccountSearchRequest {
        search = search == null ? "" : search.trim();
        status = status == null ? "all" : status;
        page = page == null ? 1 : page;
        pageSize = pageSize == null ? 8 : pageSize;
    }
}
