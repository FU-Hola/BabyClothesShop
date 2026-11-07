package com.fptu.project_group2.authaccount.dto.request;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.validation.Utf8ByteLength;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.Locale;

public record CreateStaffRequest(
        @NotBlank(message = "Họ và tên không được để trống")
        @Size(min = 2, max = 255, message = "Họ và tên phải có từ 2 đến 255 ký tự") String fullName,
        @NotBlank(message = "Email không được để trống") @Email(message = "Email không hợp lệ")
        @Size(max = 254, message = "Email không được vượt quá 254 ký tự") String email,
        @Pattern(regexp = "^(?:0|\\+84)\\d{9}$", message = "Số điện thoại không hợp lệ") String phone,
        @NotBlank(message = "Mã nhân viên không được để trống")
        @Size(max = 40, message = "Mã nhân viên không được vượt quá 40 ký tự") String employeeCode,
        @NotBlank(message = "Chức danh không được để trống")
        @Size(max = 100, message = "Chức danh không được vượt quá 100 ký tự") String position,
        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        @Utf8ByteLength(max = 72, message = "Mật khẩu không được vượt quá 72 byte UTF-8") String password,
        @NotNull(message = "Chọn quyền STORE_STAFF hoặc WAREHOUSE_STAFF") UserRole role
) {
    public CreateStaffRequest {
        fullName = fullName == null ? null : fullName.trim();
        email = email == null ? null : email.trim().toLowerCase(Locale.ROOT);
        employeeCode = employeeCode == null ? null : employeeCode.trim().toUpperCase(Locale.ROOT);
        position = position == null ? null : position.trim();
        phone = phone == null ? null : phone.replaceAll("[\\s.-]", "");
        phone = phone == null || phone.isEmpty() ? null : phone;
    }

    // Chặn client tự gửi thêm status, createdBy hoặc các trường không thuộc API này.
    @JsonAnySetter
    public void rejectUnknownField(String name, Object value) {
        throw new IllegalArgumentException("Trường không được phép: " + name);
    }
}
