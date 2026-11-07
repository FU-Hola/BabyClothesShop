package com.fptu.project_group2.authaccount;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.catalogstock.entity.Category;
import com.fptu.project_group2.catalogstock.repository.CategoryRepository;
import com.fptu.project_group2.catalogstock.repository.ProductRepository;
import com.fptu.project_group2.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Transactional
class RoleAuthorizationIntegrationTests extends IntegrationTestSupport {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void enforcesIndependentStaffAndAdminRoles() throws Exception {
        String storeToken = createUserAndLogin("store-role@example.com", UserRole.STORE_STAFF);
        String warehouseToken = createUserAndLogin("warehouse-role@example.com", UserRole.WAREHOUSE_STAFF);
        String adminToken = createUserAndLogin("admin-role@example.com", UserRole.ADMIN);
        String customerToken = createUserAndLogin("customer-role@example.com", UserRole.CUSTOMER);

        expectStatus("/api/v1/store-staff/products", storeToken, 200);
        expectStatus("/api/v1/store-staff/products", warehouseToken, 403);
        expectStatus("/api/v1/store-staff/products", adminToken, 403);
        expectStatus("/api/v1/store-staff/products", customerToken, 403);

        expectStatus("/api/v1/warehouse-staff/status", warehouseToken, 200);
        expectStatus("/api/v1/warehouse-staff/status", storeToken, 403);
        expectStatus("/api/v1/warehouse-staff/status", adminToken, 403);
        expectStatus("/api/v1/warehouse-staff/status", customerToken, 403);

        expectStatus("/api/v1/admin/probe", adminToken, 404);
        expectStatus("/api/v1/admin/probe", storeToken, 403);
        expectStatus("/api/v1/admin/probe", warehouseToken, 403);
        expectStatus("/api/v1/admin/probe", customerToken, 403);

        mockMvc.perform(get("/api/v1/store-staff/products"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value(1001));
    }

    @Test
    void createProductUsesAuthenticatedUserAndIgnoresForgedHeader() throws Exception {
        User storeUser = createUser("store-owner@example.com", UserRole.STORE_STAFF);
        User forgedUser = createUser("forged-customer@example.com", UserRole.CUSTOMER);
        String storeToken = login(storeUser.getEmail());
        Category category = new Category();
        category.setName("Newborn " + UUID.randomUUID());
        category.setSlug("newborn-" + UUID.randomUUID());
        category.setActive(true);
        category = categoryRepository.saveAndFlush(category);

        mockMvc.perform(post("/api/v1/store-staff/products")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + storeToken)
                        .header("X-User-Id", forgedUser.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "categoryId":"%s",
                                  "name":"Organic Baby Set",
                                  "description":"Soft cotton set",
                                  "variants":[{
                                    "sku":"SKU-%s",
                                    "color":"Cream",
                                    "size":"3M",
                                    "price":120000,
                                    "originalPrice":150000
                                  }]
                                }
                                """.formatted(category.getId(), UUID.randomUUID())))
                .andExpect(status().isCreated());

        var savedProduct = productRepository.findAll().get(0);
        assertEquals(storeUser.getId(), savedProduct.getCreatedBy().getId());
    }

    private void expectStatus(String path, String token, int expectedStatus) throws Exception {
        mockMvc.perform(get(path).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().is(expectedStatus));
    }

    private String createUserAndLogin(String email, UserRole role) throws Exception {
        createUser(email, role);
        return login(email);
    }

    private User createUser(String email, UserRole role) {
        User user = new User();
        user.setEmail(email);
        user.setFullName(role.name() + " User");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.saveAndFlush(user);
    }

    private String login(String email) throws Exception {
        var result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"secret123"}
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();
    }
}
