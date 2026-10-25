package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Transactional
class UserAuthenticationIntegrationTests extends IntegrationTestSupport {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Test
    void authenticatesEmailCaseInsensitivelyAndExposesRealRole() {
        User user = saveUser("staff@example.com", "secret123", UserStatus.ACTIVE, null);

        var authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated("STAFF@EXAMPLE.COM", "secret123")
        );

        assertTrue(authentication.isAuthenticated());
        AuthenticatedUser principal = (AuthenticatedUser) authentication.getPrincipal();
        assertEquals(user.getId(), principal.id());
        assertEquals("ROLE_STORE_STAFF", principal.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void rejectsWrongPassword() {
        saveUser("staff@example.com", "secret123", UserStatus.ACTIVE, null);

        assertThrows(
                org.springframework.security.core.AuthenticationException.class,
                () -> authenticationManager.authenticate(
                        UsernamePasswordAuthenticationToken.unauthenticated("staff@example.com", "wrong")
                )
        );
    }

    @Test
    void rejectsInactiveOrDeletedUsers() {
        saveUser("inactive@example.com", "secret123", UserStatus.INACTIVE, null);
        saveUser("deleted@example.com", "secret123", UserStatus.ACTIVE, Instant.now());

        assertThrows(DisabledException.class, () -> authenticate("inactive@example.com"));
        assertThrows(DisabledException.class, () -> authenticate("deleted@example.com"));
    }

    private void authenticate(String email) {
        authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(email, "secret123")
        );
    }

    private User saveUser(String email, String password, UserStatus status, Instant deletedAt) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName("Store Staff");
        user.setRole(UserRole.STORE_STAFF);
        user.setStatus(status);
        user.setDeletedAt(deletedAt);
        return userRepository.saveAndFlush(user);
    }
}
