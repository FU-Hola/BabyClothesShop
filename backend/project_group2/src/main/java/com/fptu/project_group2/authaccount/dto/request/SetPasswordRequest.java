package com.fptu.project_group2.authaccount.dto.request;

import com.fptu.project_group2.authaccount.validation.Utf8ByteLength;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SetPasswordRequest(
        @NotBlank(message = "Token không được để trống")
        @Size(max = 128, message = "Token không hợp lệ") String token,
        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        @Utf8ByteLength(max = 72, message = "Mật khẩu không được vượt quá 72 byte UTF-8")
        String newPassword,
        @NotBlank(message = "Xác nhận mật khẩu không được để trống")
        @Utf8ByteLength(max = 72, message = "Mật khẩu xác nhận không được vượt quá 72 byte UTF-8")
        String confirmPassword
) {
}
