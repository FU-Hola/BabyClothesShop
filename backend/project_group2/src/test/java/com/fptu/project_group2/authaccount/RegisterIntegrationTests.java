package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.service.AuthService;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RegisterIntegrationTests extends IntegrationTestSupport {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthSessionRepository sessionRepository;

    @Autowired
    private AuthService authService;

    @BeforeEach
    void clearUsers() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registersCustomerWithNormalizedDataAndHashedPassword() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "  Nguyễn Văn An  ",
                                  "email": "  An@Example.COM  ",
                                  "password": "secret123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("an@example.com"))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn An"))
                .andExpect(jsonPath("$.data.role").value("CUSTOMER"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());

        var saved = userRepository.findByEmailIgnoreCase("AN@EXAMPLE.COM").orElseThrow();
        assertFalse(saved.getPasswordHash().equals("secret123"));
    }

    @Test
    void rejectsDuplicateEmailAndInvalidUtf8Password() throws Exception {
        authService.register(new RegisterRequest("First User", "user@example.com", "secret123"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Second User","email":"USER@EXAMPLE.COM","password":"secret123"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value(1008));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"fullName":"Second User","email":"second@example.com","password":"😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀😀"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void concurrentRegistrationCreatesOnlyOneAccount() throws Exception {
        var ready = new CountDownLatch(2);
        var start = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        try {
            var tasks = java.util.stream.Stream.of("RACE@example.com", "race@example.com")
                    .map(email -> executor.submit(() -> {
                        ready.countDown();
                        start.await();
                        try {
                            authService.register(new RegisterRequest("Race User", email, "secret123"));
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
            assertEquals(1, userRepository.count());
        } finally {
            executor.shutdownNow();
        }
    }
}
