package com.fptu.project_group2.common.security;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import java.util.UUID;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Component;

/** Resolves the authenticated actor from the authenticated request. */
@Component
@RequiredArgsConstructor
public class CurrentActorProvider {
    private final UserRepository users;

    public User currentActor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new AuthenticationCredentialsNotFoundException("Chưa đăng nhập");
        }
        return users.findById(principal.id()).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Tài khoản không còn tồn tại"));
    }
    // Scheduled expiry has no authenticated user; its ledger actor remains null.
    public UUID currentActorIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser principal) {
            return principal.id();
        }
        return null;
    }
}
