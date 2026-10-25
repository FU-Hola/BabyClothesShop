package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.dto.request.LoginRequest;
import com.fptu.project_group2.authaccount.dto.request.RefreshTokenRequest;
import com.fptu.project_group2.authaccount.dto.response.AuthTokensResponse;
import com.fptu.project_group2.authaccount.dto.response.UserResponse;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.authaccount.security.JwtService;
import com.fptu.project_group2.authaccount.security.TokenHashingService;
import com.fptu.project_group2.authaccount.security.TokenType;
import com.fptu.project_group2.authaccount.security.ValidatedJwt;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.jsonwebtoken.JwtException;

import java.util.Locale;
import java.util.Map;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuthSessionService sessionService;
    private final AuthSessionRepository sessionRepository;
    private final TokenHashingService tokenHashingService;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String fullName = request.fullName().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        validateNormalizedName(fullName);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
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
    public AuthTokensResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );
        AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();
        User user = userRepository.findById(principal.id())
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.INVALID_CREDENTIALS));

        Instant issuedAt = Instant.now();
        Instant sessionExpiresAt = issuedAt.plusSeconds(jwtService.refreshTtlSeconds());
        Instant accessExpiresAt = issuedAt.plusSeconds(jwtService.accessTtlSeconds());
        if (accessExpiresAt.isAfter(sessionExpiresAt)) {
            accessExpiresAt = sessionExpiresAt;
        }
        UUID sessionKey = UUID.randomUUID();
        String accessToken = jwtService.generateAccessToken(user.getId(), sessionKey, issuedAt, accessExpiresAt);
        String refreshToken = jwtService.generateRefreshToken(user.getId(), sessionKey, issuedAt, sessionExpiresAt);
        sessionService.create(user, sessionKey, refreshToken, sessionExpiresAt);

        return new AuthTokensResponse(
                accessToken,
                refreshToken,
                "Bearer",
                accessExpiresAt.getEpochSecond() - issuedAt.getEpochSecond(),
                UserResponse.from(user)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BaseBusinessException(ErrorCode.UNAUTHENTICATED));
        return UserResponse.from(user);
    }

    @Transactional
    public AuthTokensResponse refresh(RefreshTokenRequest request) {
        ValidatedJwt claims = validateRefreshToken(request.refreshToken());
        var session = sessionRepository.findBySessionKeyForUpdate(claims.sessionId())
                .orElseThrow(this::invalidToken);
        Instant now = Instant.now();
        User user = session.getUser();
        if (!session.isActiveAt(now)
                || !user.getId().equals(claims.userId())
                || !tokenHashingService.matches(request.refreshToken(), session.getRefreshTokenHash())
                || user.getStatus() != UserStatus.ACTIVE
                || user.getDeletedAt() != null) {
            throw invalidToken();
        }

        Instant accessExpiresAt = now.plusSeconds(jwtService.accessTtlSeconds());
        if (accessExpiresAt.isAfter(session.getExpiresAt())) {
            accessExpiresAt = session.getExpiresAt();
        }
        String accessToken = jwtService.generateAccessToken(
                user.getId(), session.getSessionKey(), now, accessExpiresAt
        );
        String refreshToken = jwtService.generateRefreshToken(
                user.getId(), session.getSessionKey(), now, session.getExpiresAt()
        );
        session.setRefreshTokenHash(tokenHashingService.hash(refreshToken));
        sessionRepository.saveAndFlush(session);

        return new AuthTokensResponse(
                accessToken,
                refreshToken,
                "Bearer",
                accessExpiresAt.getEpochSecond() - now.getEpochSecond(),
                UserResponse.from(user)
        );
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        ValidatedJwt claims = validateRefreshToken(request.refreshToken());
        var session = sessionRepository.findBySessionKeyForUpdate(claims.sessionId())
                .orElseThrow(this::invalidToken);
        if (!session.getUser().getId().equals(claims.userId())
                || !tokenHashingService.matches(request.refreshToken(), session.getRefreshTokenHash())) {
            throw invalidToken();
        }
        if (session.getRevokedAt() == null) {
            session.setRevokedAt(Instant.now());
            sessionRepository.saveAndFlush(session);
        }
    }

    private ValidatedJwt validateRefreshToken(String refreshToken) {
        try {
            return jwtService.validate(refreshToken, TokenType.REFRESH);
        } catch (JwtException | IllegalArgumentException exception) {
            throw invalidToken();
        }
    }

    private BaseBusinessException invalidToken() {
        return new BaseBusinessException(ErrorCode.TOKEN_EXPIRED);
    }

    private void validateNormalizedName(String fullName) {
        if (fullName.length() < 2 || fullName.length() > 255) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Dữ liệu đầu vào không hợp lệ",
                    Map.of("fullName", "Họ và tên phải có từ 2 đến 255 ký tự")
            );
        }
    }
}
