package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {
    private static final String SESSION_ID_CLAIM = "sid";
    private static final String TOKEN_TYPE_CLAIM = "token_type";

    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        try {
            byte[] secret = Decoders.BASE64.decode(properties.secretBase64());
            if (secret.length < 32) {
                throw new IllegalArgumentException("JWT secret must contain at least 32 bytes");
            }
            signingKey = Keys.hmacShaKeyFor(secret);
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("JWT_SECRET_BASE64 must be valid Base64 with at least 32 bytes", exception);
        }
    }

    public String generateAccessToken(UUID userId, UUID sessionId, Instant issuedAt, Instant expiresAt) {
        return generate(userId, sessionId, TokenType.ACCESS, null, issuedAt, expiresAt);
    }

    public String generateRefreshToken(UUID userId, UUID sessionId, Instant issuedAt, Instant expiresAt) {
        return generate(userId, sessionId, TokenType.REFRESH, UUID.randomUUID().toString(), issuedAt, expiresAt);
    }

    public ValidatedJwt validate(String token, TokenType expectedType) {
        Claims claims = Jwts.parser()
                .verifyWith(signingKey)
                .sig().clear().add(Jwts.SIG.HS256).and()
                .requireIssuer(properties.issuer())
                .require(TOKEN_TYPE_CLAIM, expectedType.claimValue())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        if (claims.getAudience() == null || !claims.getAudience().contains(properties.audience())) {
            throw new JwtException("Unexpected token audience");
        }
        if (claims.getSubject() == null || claims.getExpiration() == null) {
            throw new JwtException("Required token claims are missing");
        }

        try {
            UUID userId = UUID.fromString(claims.getSubject());
            UUID sessionId = UUID.fromString(claims.get(SESSION_ID_CLAIM, String.class));
            String jwtId = claims.getId();
            if (expectedType == TokenType.REFRESH && (jwtId == null || jwtId.isBlank())) {
                throw new JwtException("Refresh token ID is missing");
            }
            return new ValidatedJwt(userId, sessionId, jwtId, claims.getExpiration().toInstant());
        } catch (IllegalArgumentException | NullPointerException exception) {
            throw new JwtException("Token contains invalid identifiers", exception);
        }
    }

    public long accessTtlSeconds() {
        return properties.accessTtlSeconds();
    }

    public long refreshTtlSeconds() {
        return properties.refreshTtlSeconds();
    }

    private String generate(
            UUID userId,
            UUID sessionId,
            TokenType type,
            String jwtId,
            Instant issuedAt,
            Instant expiresAt
    ) {
        var builder = Jwts.builder()
                .subject(userId.toString())
                .issuer(properties.issuer())
                .audience().add(properties.audience()).and()
                .claim(SESSION_ID_CLAIM, sessionId.toString())
                .claim(TOKEN_TYPE_CLAIM, type.claimValue())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt));
        if (jwtId != null) {
            builder.id(jwtId);
        }
        return builder.signWith(signingKey, Jwts.SIG.HS256).compact();
    }
}
