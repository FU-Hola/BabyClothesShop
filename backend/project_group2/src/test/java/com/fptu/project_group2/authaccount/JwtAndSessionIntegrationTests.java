package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.JwtService;
import com.fptu.project_group2.authaccount.security.TokenHashingService;
import com.fptu.project_group2.authaccount.security.TokenType;
import com.fptu.project_group2.authaccount.service.AuthSessionService;
import com.fptu.project_group2.config.JwtProperties;
import com.fptu.project_group2.support.IntegrationTestSupport;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Transactional
class JwtAndSessionIntegrationTests extends IntegrationTestSupport {
    private static final String TEST_SECRET = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthSessionService sessionService;

    @Autowired
    private AuthSessionRepository sessionRepository;

    @Autowired
    private TokenHashingService tokenHashingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void createsAndValidatesBothTokenTypes() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant accessExpiry = now.plusSeconds(jwtService.accessTtlSeconds());
        Instant refreshExpiry = now.plusSeconds(jwtService.refreshTtlSeconds());

        String access = jwtService.generateAccessToken(userId, sessionId, now, accessExpiry);
        String refresh = jwtService.generateRefreshToken(userId, sessionId, now, refreshExpiry);

        var accessClaims = jwtService.validate(access, TokenType.ACCESS);
        var refreshClaims = jwtService.validate(refresh, TokenType.REFRESH);
        assertEquals(userId, accessClaims.userId());
        assertEquals(sessionId, accessClaims.sessionId());
        assertEquals(accessExpiry, accessClaims.expiresAt());
        assertFalse(refreshClaims.jwtId().isBlank());
        assertThrows(JwtException.class, () -> jwtService.validate(refresh, TokenType.ACCESS));
    }

    @Test
    void rejectsTamperedAndExpiredTokens() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        String valid = jwtService.generateAccessToken(userId, sessionId, now, now.plusSeconds(60));
        char replacement = valid.endsWith("a") ? 'b' : 'a';
        String tampered = valid.substring(0, valid.length() - 1) + replacement;
        String expired = jwtService.generateAccessToken(userId, sessionId, now.minusSeconds(120), now.minusSeconds(60));

        assertThrows(JwtException.class, () -> jwtService.validate(tampered, TokenType.ACCESS));
        assertThrows(JwtException.class, () -> jwtService.validate(expired, TokenType.ACCESS));
    }

    @Test
    void rejectsWrongIssuerAudienceAndMissingClaims() {
        UUID userId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        Instant now = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiresAt = now.plusSeconds(60);
        JwtService wrongIssuer = new JwtService(new JwtProperties(
                TEST_SECRET, 900, 604800, "another-issuer", "baby-clothes-shop-tests"
        ));
        JwtService wrongAudience = new JwtService(new JwtProperties(
                TEST_SECRET, 900, 604800, "baby-clothes-shop-test", "another-audience"
        ));
        String missingSessionId = Jwts.builder()
                .subject(userId.toString())
                .issuer("baby-clothes-shop-test")
                .audience().add("baby-clothes-shop-tests").and()
                .claim("token_type", "access")
                .expiration(Date.from(expiresAt))
                .signWith(Keys.hmacShaKeyFor(Decoders.BASE64.decode(TEST_SECRET)), Jwts.SIG.HS256)
                .compact();

        assertThrows(JwtException.class, () -> jwtService.validate(
                wrongIssuer.generateAccessToken(userId, sessionId, now, expiresAt), TokenType.ACCESS
        ));
        assertThrows(JwtException.class, () -> jwtService.validate(
                wrongAudience.generateAccessToken(userId, sessionId, now, expiresAt), TokenType.ACCESS
        ));
        assertThrows(JwtException.class, () -> jwtService.validate(missingSessionId, TokenType.ACCESS));
    }

    @Test
    void storesOnlyRefreshTokenHashInSession() {
        User user = new User();
        user.setEmail("session@example.com");
        user.setFullName("Session User");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.saveAndFlush(user);

        String refreshToken = "raw-refresh-token";
        var session = sessionService.create(user, refreshToken, Instant.now().plusSeconds(600));
        var stored = sessionRepository.findByIdWithUser(session.getId()).orElseThrow();

        assertNotEquals(refreshToken, stored.getRefreshTokenHash());
        assertEquals(64, stored.getRefreshTokenHash().length());
        assertTrue(tokenHashingService.matches(refreshToken, stored.getRefreshTokenHash()));
    }
}
