package com.fptu.project_group2.authaccount.dto.request;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AccountStatusRequest(
        @NotBlank
        @Pattern(regexp = "active|blocked", message = "Trạng thái phải là active hoặc blocked")
        String status
) {
    @JsonAnySetter
    public void rejectUnknownField(String name, Object value) {
        throw new IllegalArgumentException("Trường không được phép: " + name);
    }
}
