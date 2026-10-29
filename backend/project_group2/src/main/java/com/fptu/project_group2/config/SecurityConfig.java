package com.fptu.project_group2.config;

import com.fptu.project_group2.authaccount.security.JwtAuthenticationFilter;
import com.fptu.project_group2.common.security.ApiAccessDeniedHandler;
import com.fptu.project_group2.common.security.ApiAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Nối các thành phần bảo mật: kiểm tra mật khẩu, xác thực JWT và phân quyền URL.
 * Các bean tại đây được Spring tạo và truyền vào những lớp cần sử dụng.
 */
@Configuration(proxyBeanMethods = false)
@RequiredArgsConstructor
// Đăng ký các record cấu hình để Spring ánh xạ giá trị từ application.yaml.
@EnableConfigurationProperties({JwtProperties.class, CorsProperties.class})
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApiAuthenticationEntryPoint authenticationEntryPoint;
    private final ApiAccessDeniedHandler accessDeniedHandler;
    private final CorsProperties corsProperties;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Cookie được trình duyệt tự gửi, nên các request thay đổi dữ liệu cần CSRF.
                // CSRF token lưu trong cookie, không cần HTTP session để lưu token này.
                .csrf(csrf -> csrf.csrfTokenRepository(new CookieCsrfTokenRepository()))
                // Cho phép frontend khác origin gọi API theo danh sách cấu hình bên dưới.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Ứng dụng tự có endpoint login/logout, không dùng các cơ chế mặc định này.
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .logout(logout -> logout.disable())
                // Không lưu đăng nhập trong HTTP session: mỗi request tự mang JWT để xác thực.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        // Chưa đăng nhập trả JSON 401; thiếu quyền hoặc CSRF sai trả JSON 403.
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(authorize -> authorize
                        // Public về xác thực; các POST vẫn phải có CSRF token hợp lệ.
                        .requestMatchers(
                                "/api/v1/auth/register",
                                "/api/v1/auth/csrf",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/logout"
                        ).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories").permitAll()
                        // hasRole tự thêm tiền tố ROLE_ khi đối chiếu authority của user.
                        .requestMatchers("/api/v1/store-staff/**").hasRole("STORE_STAFF")
                        .requestMatchers("/api/v1/warehouse-staff/**").hasRole("WAREHOUSE_STAFF")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        // Các URL còn lại phải có Authentication trong SecurityContext.
                        .anyRequest().authenticated())
                // Đặt filter JWT vào security chain trước filter username/password.
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.allowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
        // Cho phép trình duyệt gửi cookie khi frontend gọi API khác origin.
        // CORS không thay thế bước kiểm tra CSRF.
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Dùng encode khi đăng ký; DaoAuthenticationProvider dùng matches khi login.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(UserDetailsService users, PasswordEncoder encoder) {
        // Provider tải user qua UserDetailsService rồi dùng BCrypt kiểm tra mật khẩu.
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(users);
        provider.setPasswordEncoder(encoder);
        // Manager nhận yêu cầu authenticate(...) và giao việc cho provider.
        return new ProviderManager(provider);
    }

    // Chỉ chạy JWT filter trong Spring Security, tránh đăng ký thêm ở servlet container.
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> jwtFilterRegistration() {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(jwtAuthenticationFilter);
        registration.setEnabled(false);
        return registration;
    }
}
