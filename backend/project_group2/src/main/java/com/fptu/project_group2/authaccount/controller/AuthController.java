package com.fptu.project_group2.authaccount.controller;

import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.dto.request.LoginRequest;
import com.fptu.project_group2.authaccount.dto.response.AuthTokensResponse;
import com.fptu.project_group2.authaccount.dto.response.UserResponse;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.authaccount.service.AuthService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseBuilder.created(authService.register(request), "Đăng ký tài khoản thành công");
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthTokensResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseBuilder.ok(authService.login(request), "Đăng nhập thành công");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal AuthenticatedUser principal) {
        return ResponseBuilder.ok(authService.getCurrentUser(principal.id()), "Lấy thông tin tài khoản thành công");
    }
}
