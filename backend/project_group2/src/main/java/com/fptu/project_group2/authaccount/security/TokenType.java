package com.fptu.project_group2.authaccount.security;

// Hai mục đích khác nhau; JwtService kiểm tra loại phù hợp trước khi chấp nhận JWT.
public enum TokenType {
    ACCESS("access"),
    REFRESH("refresh");

    private final String claimValue;

    TokenType(String claimValue) {
        this.claimValue = claimValue;
    }

    public String claimValue() {
        return claimValue;
    }
}
