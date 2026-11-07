package com.fptu.project_group2.warehouse.utils;

import java.util.Locale;

public final class WarehouseSearch {
    private WarehouseSearch() {}

    // Tìm kiếm chuỗi literal, không coi %, _ do người dùng nhập là wildcard SQL.
    public static String pattern(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return "%";
        }
        String escaped = keyword.trim().toLowerCase(Locale.ROOT)
                .replace("!", "!!")
                .replace("%", "!%")
                .replace("_", "!_");
        return "%" + escaped + "%";
    }
}
