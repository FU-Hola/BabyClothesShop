package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.security.TokenHashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

/** Tạo link một lần và gửi email thiết lập hoặc đặt lại mật khẩu. */
@Service
@RequiredArgsConstructor
public class PasswordLinkService {
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final TokenHashingService tokenHashingService;
    private final JavaMailSender mailSender;

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Value("${app.password-link-ttl-minutes:30}")
    private long passwordLinkTtlMinutes;

    @Value("${spring.mail.from:no-reply@babyclothesshop.local}")
    private String mailFrom;

    public String issue(User user) {
        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
        user.setPasswordResetTokenHash(tokenHashingService.hash(rawToken));
        user.setPasswordResetExpiresAt(Instant.now().plus(passwordLinkTtlMinutes, ChronoUnit.MINUTES));
        return rawToken;
    }

    public void send(User user, String rawToken) {
        boolean firstSetup = user.getPasswordHash() == null;
        String action = firstSetup ? "thiết lập" : "đặt lại";
        String baseUrl = frontendBaseUrl.endsWith("/")
                ? frontendBaseUrl.substring(0, frontendBaseUrl.length() - 1)
                : frontendBaseUrl;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(user.getEmail());
        message.setSubject(firstSetup
                ? "Thiết lập mật khẩu tài khoản BabyClothesShop"
                : "Đặt lại mật khẩu BabyClothesShop");
        message.setText("Xin chào " + user.getFullName() + ",\n\n"
                + "Vui lòng mở link sau để " + action + " mật khẩu:\n"
                + baseUrl + "/set-password?token=" + rawToken + "\n\n"
                + "Link có hiệu lực trong " + passwordLinkTtlMinutes + " phút và chỉ dùng được một lần.\n"
                + "Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email.");
        mailSender.send(message);
    }
}
