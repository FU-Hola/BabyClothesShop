package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.dto.request.RefreshTokenRequest;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.service.AuthService;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RefreshAndLogoutIntegrationTests extends IntegrationTestSupport {
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
    private AuthService authService;

    @BeforeEach
    void resetAuthenticationData() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
        User user = new User();
        user.setEmail("customer@example.com");
        user.setFullName("Customer Account");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);
        userRepository.saveAndFlush(user);
    }

    @Test
    void refreshRotatesTokenAndRejectsThePreviousToken() throws Exception {
        JsonNode login = login();
        String oldRefresh = login.path("refreshToken").asText();

        var refreshResult = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(oldRefresh)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();
        JsonNode refreshed = objectMapper.readTree(refreshResult.getResponse().getContentAsString()).path("data");
        assertNotEquals(oldRefresh, refreshed.path("refreshToken").asText());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(oldRefresh)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1004));
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshed.path("accessToken").asText()))
                .andExpect(status().isOk());
    }

    @Test
    void simultaneousRefreshAllowsOnlyOneRotation() throws Exception {
        String refreshToken = login().path("refreshToken").asText();
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        try {
            var tasks = java.util.stream.IntStream.range(0, 2)
                    .mapToObj(index -> executor.submit(() -> {
                        ready.countDown();
                        start.await();
                        try {
                            authService.refresh(new RefreshTokenRequest(refreshToken));
                            return true;
                        } catch (BaseBusinessException exception) {
                            return false;
                        }
                    }))
                    .toList();
            ready.await();
            start.countDown();

            int successes = 0;
            for (var task : tasks) {
                if (task.get()) {
                    successes++;
                }
            }
            assertEquals(1, successes);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void logoutImmediatelyRevokesOnlyTheSelectedSessionAndIsIdempotent() throws Exception {
        JsonNode first = login();
        JsonNode second = login();
        String logoutBody = refreshBody(first.path("refreshToken").asText());

        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(logoutBody))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(logoutBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + first.path("accessToken").asText()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1004));
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + second.path("accessToken").asText()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(logoutBody))
                .andExpect(status().isUnauthorized());
    }

    private JsonNode login() throws Exception {
        var result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"customer@example.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
    }

    private String refreshBody(String refreshToken) throws Exception {
        return objectMapper.writeValueAsString(new RefreshTokenRequest(refreshToken));
    }
}
