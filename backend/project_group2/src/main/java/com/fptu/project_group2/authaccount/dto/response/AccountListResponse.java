package com.fptu.project_group2.authaccount.dto.response;

import java.util.List;

// Giữ items/pagination/stats giống dữ liệu mà màn hình FE đang cần, bên trong ApiResponse.data.
public record AccountListResponse(List<AccountResponse> items, Pagination pagination, Stats stats) {
    public record Pagination(int page, int pageSize, long total, int totalPages) {
    }

    public record Stats(long total, long active, long blocked, long deleted) {
    }
}
