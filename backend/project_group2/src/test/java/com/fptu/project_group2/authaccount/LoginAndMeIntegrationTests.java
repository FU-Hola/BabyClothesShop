package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.security.JwtService;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class LoginAndMeIntegrationTests extends IntegrationTestSupport {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthSessionRepository sessionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void clearAuthenticationData() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void loginIssuesRealTokensAndAccessTokenLoadsCurrentUser() throws Exception {
        saveUser("customer@example.com", UserStatus.ACTIVE, null);

        var loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"CUSTOMER@example.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.expiresIn").value(900))
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist())
                .andReturn();
        String accessToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("customer@example.com"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
    }

    @Test
    void rejectsBadCredentialsAndInactiveAccount() throws Exception {
        saveUser("active@example.com", UserStatus.ACTIVE, null);
        saveUser("inactive@example.com", UserStatus.INACTIVE, null);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"active@example.com","password":"wrong-password"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1003));
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"inactive@example.com","password":"secret123"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1003));
    }

    @Test
    void protectedEndpointReturnsStructuredUnauthorizedErrors() throws Exception {
        User user = saveUser("customer@example.com", UserStatus.ACTIVE, null);
        Instant now = Instant.now();
        String tokenWithoutSession = jwtService.generateAccessToken(
                user.getId(), UUID.randomUUID(), now, now.plusSeconds(60)
        );

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1001));
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + tokenWithoutSession))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1004));
    }

    private User saveUser(String email, UserStatus status, Instant deletedAt) {
        User user = new User();
        user.setEmail(email);
        user.setFullName("Customer Account");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(status);
        user.setDeletedAt(deletedAt);
        return userRepository.saveAndFlush(user);
    }
}
