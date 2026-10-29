package com.fptu.project_group2.authaccount.security;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Băm refresh token để lưu/tra cứu trong DB. Hash không dùng thay cho JWT để gọi API.
 * Mật khẩu được băm riêng bằng BCrypt, không dùng hàm SHA-256 này.
 */
@Service
public class TokenHashingService {
    public String hash(String token) {
        try {
            // Cùng một token sẽ tạo cùng hash, giúp so khớp mà không lưu token gốc.
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            // SHA-256 cho 32 byte; biểu diễn dạng hex sẽ có 64 ký tự.
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
