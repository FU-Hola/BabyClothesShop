package com.fptu.project_group2.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Nhận cấu hình app.jwt từ application.yaml; record tạo các hàm như accessTtlSeconds().
 * NotBlank/Min kiểm tra cấu hình khi khởi động để phát hiện giá trị thiếu hoặc sai.
 */
@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        // Khóa bí mật dạng Base64; JwtService giải mã thành byte trước khi ký.
        @NotBlank String secretBase64,
        // Thời hạn access token và refresh token, đều tính bằng giây.
        @Min(1) long accessTtlSeconds,
        @Min(1) long refreshTtlSeconds,
        // issuer là hệ thống cấp token; audience là ứng dụng nhận token.
        @NotBlank String issuer,
        @NotBlank String audience
) {
}
