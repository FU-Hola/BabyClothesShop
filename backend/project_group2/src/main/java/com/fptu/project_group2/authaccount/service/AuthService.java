package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.dto.request.ForgotPasswordRequest;
import com.fptu.project_group2.authaccount.dto.request.LoginRequest;
import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.dto.request.SetPasswordRequest;
import com.fptu.project_group2.authaccount.dto.response.AuthTokensResponse;
import com.fptu.project_group2.authaccount.dto.response.UserResponse;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.authaccount.security.JwtService;
import com.fptu.project_group2.authaccount.security.TokenHashingService;
import com.fptu.project_group2.authaccount.security.TokenType;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.MailException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Xử lý nghiệp vụ đăng ký, đăng nhập, refresh và logout.
 * Mỗi tài khoản chỉ lưu một refresh token hiện tại; không quản lý từng phiên/thiết bị.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final TokenHashingService tokenHashingService;
    private final PasswordLinkService passwordLinkService;

    // Transaction giúp các thay đổi database trong một thao tác được commit cùng nhau.
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String fullName = request.fullName().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (fullName.length() < 2 || fullName.length() > 255) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Dữ liệu đầu vào không hợp lệ",
                    Map.of("fullName", "Họ và tên phải có từ 2 đến 255 ký tự")
            );
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        // Chỉ lưu hash BCrypt của mật khẩu; đăng ký luôn tạo CUSTOMER.
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        try {
            return UserResponse.from(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException exception) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email())
                .filter(this::canReceivePasswordLink)
                .ifPresent(user -> {
                    String rawToken = passwordLinkService.issue(user);
                    userRepository.saveAndFlush(user);
                    try {
                        passwordLinkService.send(user, rawToken);
                    } catch (MailException exception) {
                        // Phản hồi vẫn giống email không tồn tại để không làm lộ tài khoản.
                        log.warn("Không thể gửi email đặt lại mật khẩu cho user {}", user.getId(), exception);
                    }
                });
    }

    @Transactional
    public void setPassword(SetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Dữ liệu đầu vào không hợp lệ",
                    Map.of("confirmPassword", "Mật khẩu xác nhận không khớp")
            );
        }

        User user = userRepository.findByPasswordResetTokenHashForUpdate(tokenHashingService.hash(request.token()))
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.PASSWORD_LINK_INVALID));
        if (!canReceivePasswordLink(user)
                || user.getPasswordResetExpiresAt() == null
                || !user.getPasswordResetExpiresAt().isAfter(Instant.now())) {
            throw new BaseBusinessException(ErrorCode.PASSWORD_LINK_INVALID);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setPasswordResetTokenHash(null);
        user.setPasswordResetExpiresAt(null);
        // Đặt lại mật khẩu thu hồi refresh token hiện tại và yêu cầu đăng nhập lại.
        user.setRefreshTokenHash(null);
        user.setRefreshTokenExpiresAt(null);
        userRepository.saveAndFlush(user);
    }

    @Transactional
    public AuthTokensResponse login(LoginRequest request) {
        // Bước 1: tạo yêu cầu xác thực email/password chưa được xác thực.
        // UsernamePasswordAuthenticationToken là đối tượng Java của Spring, chưa phải JWT.
        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );
        // AuthenticationManager -> DaoAuthenticationProvider -> UserDetailsService + BCrypt.
        // Nếu đúng mật khẩu, principal là AuthenticatedUser; nếu sai thì ném exception.
        AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();
        // Bước 2: lấy user để cập nhật refresh token trong cùng transaction.
        User user = userRepository.findByIdForUpdate(principal.id())
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.INVALID_CREDENTIALS));
        // Kiểm tra lại trạng thái sau khi lấy khóa dòng, phòng tài khoản vừa bị vô hiệu hóa.
        if (!AuthenticatedUser.from(user).isEnabled()) {
            throw new BaseBusinessException(ErrorCode.INVALID_CREDENTIALS);
        }
        // Chỉ cập nhật lần đăng nhập bằng mật khẩu, không cập nhật khi refresh JWT.
        user.setLastLoginAt(Instant.now());
        // Bước 3: cấp hai JWT, lưu hash refresh token và trả kết quả cho controller.
        return issueTokens(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        // userId đến từ principal đã xác thực, không lấy từ dữ liệu client tự khai báo.
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.UNAUTHENTICATED));
    }

    @Transactional
    public AuthTokensResponse refresh(String refreshToken) {
        Claims claims;
        try {
            // Bước 1: refresh cookie phải chứa JWT còn hạn và có token_type = refresh.
            claims = jwtService.verifyAndExtract(refreshToken, TokenType.REFRESH);
        } catch (JwtException | IllegalArgumentException exception) {
            throw new BaseBusinessException(ErrorCode.TOKEN_EXPIRED);
        }
        // Bước 2: băm token nhận được để tìm đúng hash đang lưu trong database.
        // Token cũ sau login/refresh mới hoặc sau logout sẽ không còn khớp.
        User user = userRepository.findByRefreshTokenHashForUpdate(tokenHashingService.hash(refreshToken))
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.TOKEN_EXPIRED));
        // Bước 3: kiểm tra chủ token, trạng thái tài khoản và thời hạn lưu trong DB.
        if (!jwtService.verifyUser(claims, AuthenticatedUser.from(user))
                || user.getRefreshTokenExpiresAt() == null
                || !user.getRefreshTokenExpiresAt().isAfter(Instant.now())) {
            throw new BaseBusinessException(ErrorCode.TOKEN_EXPIRED);
        }
        // Bước 4: thay hash cũ bằng hash của refresh token mới (rotation).
        return issueTokens(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        // Chỉ thu hồi refresh token đang khớp trong DB. Gọi lại logout vẫn thành công.
        // Cookie được xóa ở controller; access token sao chép còn dùng được đến exp.
        if (refreshToken != null && !refreshToken.isBlank()) {
            userRepository.findByRefreshTokenHashForUpdate(tokenHashingService.hash(refreshToken))
                    .ifPresent(user -> {
                        user.setRefreshTokenHash(null);
                        user.setRefreshTokenExpiresAt(null);
                    });
        }
    }

    // Dùng chung cho login và refresh để tránh viết lặp phần cấp/lưu token.
    private AuthTokensResponse issueTokens(User user) {
        AuthenticatedUser principal = AuthenticatedUser.from(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);
        // Chỉ lưu hash SHA-256 và thời hạn; không lưu nguyên chuỗi JWT vào DB.
        user.setRefreshTokenHash(tokenHashingService.hash(refreshToken));
        user.setRefreshTokenExpiresAt(Instant.now().plusSeconds(jwtProperties.refreshTtlSeconds()));
        userRepository.saveAndFlush(user);
        // Đối tượng nội bộ để controller đặt cookie; không trả hai JWT trong JSON.
        return new AuthTokensResponse(
                accessToken, refreshToken,
                jwtProperties.accessTtlSeconds(), jwtProperties.refreshTtlSeconds(),
                UserResponse.from(user)
        );
    }

    private boolean canReceivePasswordLink(User user) {
        return user.getStatus() == UserStatus.ACTIVE
                && user.getDeletedAt() == null
                && user.getRole() != UserRole.ADMIN;
    }
}
