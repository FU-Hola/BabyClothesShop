package com.fptu.project_group2.warehouse.utils;

import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Component;

/** Resolves the warehouse actor from the authenticated request. */
@Component
@RequiredArgsConstructor
public class WarehouseActorProvider {
    private final UserRepository users;

    public User currentActor() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser principal)) {
            throw new AuthenticationCredentialsNotFoundException("Chưa đăng nhập");
        }
        return users.findById(principal.id()).orElseThrow(() ->
                new AuthenticationCredentialsNotFoundException("Tài khoản không còn tồn tại"));
    }
}
