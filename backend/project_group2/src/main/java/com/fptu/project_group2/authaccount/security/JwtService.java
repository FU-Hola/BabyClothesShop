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

/**
 * Tạo và xác minh JWT; không đọc cookie và không truy vấn database.
 * Access token dùng để gọi API, refresh token dùng để xin cặp token mới.
 */
@Service
public class JwtService {
    private final JwtProperties properties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        // Đọc secret từ cấu hình, giải mã Base64 rồi tạo khóa ký HMAC.
        // JJWT từ chối khóa ngắn hơn 32 byte; không ghi khóa thật trực tiếp vào code.
        signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(properties.secretBase64()));
    }

    public String generateAccessToken(AuthenticatedUser user) {
        // Thời hạn mặc định: 900 giây, tức 15 phút.
        return generateToken(user, TokenType.ACCESS, properties.accessTtlSeconds());
    }

    public String generateRefreshToken(AuthenticatedUser user) {
        // Thời hạn mặc định: 604800 giây, tức 7 ngày.
        return generateToken(user, TokenType.REFRESH, properties.refreshTtlSeconds());
    }

    /**
     * Xác minh token rồi trả thông tin bên trong (claims).
     * expectedType ngăn việc dùng refresh token để gọi API cần access token.
     * Token sai hoặc hết hạn sẽ gây exception, không trả claims để sử dụng tiếp.
     */
    public Claims verifyAndExtract(String token, TokenType expectedType) {
        Claims claims = Jwts.parser()
                // Dùng cùng khóa bí mật đã ký token để kiểm tra chữ ký.
                .verifyWith(signingKey)
                // Chỉ chấp nhận thuật toán HS256 mà ứng dụng đang sử dụng.
                .sig().clear().add(Jwts.SIG.HS256).and()
                // Token phải do đúng hệ thống cấp và có đúng loại được yêu cầu.
                .requireIssuer(properties.issuer())
                .require("token_type", expectedType.claimValue())
                .build()
                // Không chỉ đọc JSON: bước này kiểm tra cả chữ ký và thời hạn exp.
                .parseSignedClaims(token)
                .getPayload();
        // aud cho biết ứng dụng nhận token; token phải dành cho dự án này.
        if (claims.getAudience() == null || !claims.getAudience().contains(properties.audience())) {
            throw new JwtException("Unexpected token audience");
        }
        // Bắt buộc có email sub, ID tài khoản uid và thời điểm hết hạn exp.
        if (claims.getSubject() == null || claims.getSubject().isBlank()
                || claims.get("uid", String.class) == null || claims.getExpiration() == null) {
            throw new JwtException("Token is missing its user ID, subject or expiry");
        }
        return claims;
    }

    public boolean verifyUser(Claims claims, AuthenticatedUser user) {
        // Chỉ gọi sau verifyAndExtract: đối chiếu email và trạng thái hiện tại của user.
        // Không parse token lần nữa vì chữ ký và thời hạn đã được kiểm tra ở trên.
        // ID cố định ngăn token của email cũ bị nhận nhầm khi email được cấp lại cho user khác.
        return user.id().toString().equals(claims.get("uid", String.class))
                && claims.getSubject().equals(user.getUsername()) && user.isEnabled();
    }

    private String generateToken(AuthenticatedUser user, TokenType type, long ttlSeconds) {
        Instant now = Instant.now();
        return Jwts.builder()
                // jti: mã riêng của token, giúp token mới khác token cũ dù cấp cùng giây.
                .id(UUID.randomUUID().toString())
                // sub: danh tính chủ token. Dự án dùng email làm username.
                .subject(user.getUsername())
                // uid gắn token với đúng tài khoản, kể cả khi quản trị viên đổi email.
                .claim("uid", user.id().toString())
                // iss: hệ thống cấp token; aud: ứng dụng nhận token.
                .issuer(properties.issuer())
                .audience().add(properties.audience()).and()
                // Claim tự định nghĩa để phân biệt "access" và "refresh".
                .claim("token_type", type.claimValue())
                // iat: thời điểm cấp; exp: thời điểm hết hạn. TTL tính bằng giây.
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(ttlSeconds)))
                // Ký để phát hiện token bị sửa; chữ ký không mã hóa nội dung payload.
                .signWith(signingKey, Jwts.SIG.HS256)
                // Ghép thành chuỗi JWT: header.payload.signature.
                .compact();
    }
}
