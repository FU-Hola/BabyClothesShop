package com.fptu.project_group2.authaccount.dto.request;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Locale;

// Email không thuộc hồ sơ được sửa; bỏ qua nếu client cũ vẫn gửi trường này.
@JsonIgnoreProperties("email")
public record UpdateStaffRequest(
        @NotBlank(message = "Họ và tên không được để trống")
        @Size(min = 2, max = 255, message = "Họ và tên phải có từ 2 đến 255 ký tự") String fullName,
        @Pattern(regexp = "^(?:0|\\+84)\\d{9}$", message = "Số điện thoại không hợp lệ") String phone,
        @NotBlank(message = "Mã nhân viên không được để trống")
        @Size(max = 40, message = "Mã nhân viên không được vượt quá 40 ký tự") String employeeCode,
        @NotBlank(message = "Chức danh không được để trống")
        @Size(max = 100, message = "Chức danh không được vượt quá 100 ký tự") String position
) {
    public UpdateStaffRequest {
        fullName = fullName == null ? null : fullName.trim();
        employeeCode = employeeCode == null ? null : employeeCode.trim().toUpperCase(Locale.ROOT);
        position = position == null ? null : position.trim();
        phone = phone == null ? null : phone.replaceAll("[\\s.-]", "");
        phone = phone == null || phone.isEmpty() ? null : phone;
    }

    @JsonAnySetter
    public void rejectUnknownField(String name, Object value) {
        throw new IllegalArgumentException("Trường không được phép: " + name);
    }
}
