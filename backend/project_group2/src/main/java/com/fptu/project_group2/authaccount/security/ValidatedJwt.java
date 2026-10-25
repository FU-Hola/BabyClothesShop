package com.fptu.project_group2.authaccount.security;

import java.time.Instant;
import java.util.UUID;

public record ValidatedJwt(
        UUID userId,
        UUID sessionId,
        String jwtId,
        Instant expiresAt
) {
}
