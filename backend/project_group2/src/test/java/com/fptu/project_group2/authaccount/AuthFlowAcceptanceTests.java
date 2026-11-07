package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.containsString;

class AuthFlowAcceptanceTests extends IntegrationTestSupport {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AuthSessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void clearAuthenticationData() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void completesRegisterLoginMeRefreshAndLogoutFlow() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName":"  Flow Customer  ",
                                  "email":"FLOW@EXAMPLE.COM",
                                  "password":"secret123"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.email").value("flow@example.com"));

        JsonNode login = responseData(mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"flow@example.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        String oldAccessToken = login.path("accessToken").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + oldAccessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("Flow Customer"));

        JsonNode refreshed = responseData(mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(login.path("refreshToken").asText())))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString());
        String newAccessToken = refreshed.path("accessToken").asText();
        String newRefreshToken = refreshed.path("refreshToken").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(newRefreshToken)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + oldAccessToken))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + newAccessToken))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(refreshBody(newRefreshToken)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void acceptsConfiguredCorsPreflight() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("POST")));
    }

    private JsonNode responseData(String response) throws Exception {
        return objectMapper.readTree(response).path("data");
    }

    private String refreshBody(String refreshToken) throws Exception {
        return objectMapper.writeValueAsString(java.util.Map.of("refreshToken", refreshToken));
    }
}
