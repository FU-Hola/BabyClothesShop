package com.fptu.project_group2.warehouse.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum GoodsReceiptStatus {
    PENDING("PENDING", "CHờ xác nhận nhập kho"),
    COMPLETED("COMPLETED", "Đã nhập kho"),
    CANCELLED("CANCELLED", "Đã hủy");

    private final String code;
    private final String label;

    @JsonCreator
    public static GoodsReceiptStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmed = value.trim();

        for (GoodsReceiptStatus status : GoodsReceiptStatus.values()) {
            if (status.name().equalsIgnoreCase(trimmed) || status.code.equalsIgnoreCase(trimmed)) {
                return status;
            }
            if (status.label.equalsIgnoreCase(trimmed)) {
                return status;
            }
        }

        throw new IllegalArgumentException("Trạng thái không hợp lệ: " + value);
    }


    @JsonValue
    public String getCode() {
        return this.code;
    }
}
