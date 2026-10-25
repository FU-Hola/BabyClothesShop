package com.fptu.project_group2.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        @NotBlank String secretBase64,
        @Min(1) long accessTtlSeconds,
        @Min(1) long refreshTtlSeconds,
        @NotBlank String issuer,
        @NotBlank String audience
) {
}
