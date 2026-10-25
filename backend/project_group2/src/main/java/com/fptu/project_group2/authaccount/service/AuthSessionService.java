package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.entity.AuthSession;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.security.TokenHashingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthSessionService {
    private final AuthSessionRepository sessionRepository;
    private final TokenHashingService tokenHashingService;

    @Transactional
    public AuthSession create(User user, String refreshToken, Instant expiresAt) {
        AuthSession session = new AuthSession();
        session.setUser(user);
        session.setRefreshTokenHash(tokenHashingService.hash(refreshToken));
        session.setExpiresAt(expiresAt);
        return sessionRepository.saveAndFlush(session);
    }
}
