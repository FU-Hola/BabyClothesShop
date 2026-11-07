package com.fptu.project_group2.authaccount.dto.response;

/**
 * Kết quả nội bộ AuthService đưa cho controller để đặt hai cookie.
 * Controller chỉ trả user trong JSON. expiresIn và refreshExpiresIn có đơn vị giây.
 */
public record AuthTokensResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        long refreshExpiresIn,
        UserResponse user
) {
}
