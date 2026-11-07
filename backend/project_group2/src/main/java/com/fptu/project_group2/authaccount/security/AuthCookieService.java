package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.authaccount.dto.response.AuthTokensResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/**
 * Chỉ xử lý nơi vận chuyển token: đọc Cookie từ request, ghi Set-Cookie vào response.
 * Tạo và xác minh nội dung JWT là trách nhiệm của JwtService.
 */
@Component
public class AuthCookieService {
    public static final String ACCESS_TOKEN = "accessToken";
    public static final String REFRESH_TOKEN = "refreshToken";
    // Refresh cookie chỉ cần được gửi tới các endpoint auth.
    private static final String AUTH_PATH = "/api/v1/auth";

    private final boolean secure;

    public AuthCookieService(@Value("${app.auth-cookie.secure:false}") boolean secure) {
        // HTTP localhost dùng false; khi triển khai HTTPS cấu hình thành true.
        this.secure = secure;
    }

    public String read(HttpServletRequest request, String name) {
        // Không có cookie hoặc không tìm thấy tên cần đọc thì trả null.
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (name.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    public void write(HttpServletResponse response, AuthTokensResponse tokens) {
        // Access cookie dùng trên toàn API; refresh cookie giới hạn ở AUTH_PATH.
        // maxAge tính bằng giây và lấy cùng TTL dùng khi cấp JWT.
        addCookie(response, ACCESS_TOKEN, tokens.accessToken(), "/", tokens.expiresIn());
        addCookie(response, REFRESH_TOKEN, tokens.refreshToken(), AUTH_PATH, tokens.refreshExpiresIn());
    }

    public void clear(HttpServletResponse response) {
        // Xóa cookie bằng cùng tên/path đã tạo và thời gian tồn tại bằng 0.
        addCookie(response, ACCESS_TOKEN, "", "/", 0);
        addCookie(response, REFRESH_TOKEN, "", AUTH_PATH, 0);
    }

    private void addCookie(HttpServletResponse response, String name, String value, String path, long maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                // Trình duyệt vẫn gửi cookie nhưng JavaScript không đọc được giá trị.
                .httpOnly(true)
                // true: chỉ gửi qua HTTPS.
                .secure(secure)
                // Hạn chế gửi cookie từ website khác; ứng dụng vẫn bật bảo vệ CSRF.
                .sameSite("Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
        // Dùng addHeader để giữ cả hai Set-Cookie, không ghi đè cookie đã thêm trước đó.
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
