package com.fptu.project_group2.authaccount.controller;

import com.fptu.project_group2.authaccount.dto.request.LoginRequest;
import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.dto.response.AuthTokensResponse;
import com.fptu.project_group2.authaccount.dto.response.UserResponse;
import com.fptu.project_group2.authaccount.security.AuthCookieService;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.authaccount.service.AuthService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Nhận HTTP request, gọi AuthService và đặt/xóa cookie trên HTTP response.
 * JSON trả profile qua UserResponse; JWT chỉ được gửi bằng cookie HttpOnly.
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final AuthCookieService cookieService;

    @GetMapping("/csrf")
    public ResponseEntity<ApiResponse<Map<String, String>>> csrf(CsrfToken token) {
        // Spring cung cấp CSRF token; client lấy data.token gửi ở header X-XSRF-TOKEN.
        // CSRF token bảo vệ thao tác thay đổi dữ liệu, không phải JWT đăng nhập.
        return ResponseBuilder.ok(Map.of("token", token.getToken()), "Lấy CSRF token thành công");
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseBuilder.created(authService.register(request), "Đăng ký tài khoản thành công");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthTokensResponse tokens = authService.login(request);
        // Set-Cookie yêu cầu trình duyệt lưu accessToken và refreshToken.
        cookieService.write(response, tokens);
        return ResponseBuilder.ok(tokens.user(), "Đăng nhập thành công");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        // Spring lấy principal từ SecurityContext mà JwtAuthenticationFilter đã tạo.
        return ResponseBuilder.ok(authService.getCurrentUser(principal.id()), "Lấy thông tin tài khoản thành công");
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<UserResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        // Refresh token được đọc từ cookie; client không cần gửi JSON body.
        AuthTokensResponse tokens = authService.refresh(cookieService.read(request, AuthCookieService.REFRESH_TOKEN));
        // Thay cookie cũ bằng cặp token vừa được cấp.
        cookieService.write(response, tokens);
        return ResponseBuilder.ok(tokens.user(), "Làm mới phiên đăng nhập thành công");
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        try {
            authService.logout(cookieService.read(request, AuthCookieService.REFRESH_TOKEN));
        } finally {
            // Xóa cookie phía client kể cả khi thao tác thu hồi refresh token gặp lỗi.
            cookieService.clear(response);
        }
        return ResponseBuilder.ok(null, "Đăng xuất thành công");
    }
}
