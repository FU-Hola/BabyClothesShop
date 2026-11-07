package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.security.SecurityErrorWriter;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

/**
 * Chạy trước controller để xác thực access token cho request hiện tại.
 * Filter chỉ kiểm tra đăng nhập; việc cấp/lưu refresh token nằm trong AuthService.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Set<String> PUBLIC_AUTH_PATHS = Set.of(
            "/api/v1/auth/register",
            "/api/v1/auth/csrf",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout"
    );

    private final JwtService jwtService;
    private final AuthCookieService cookieService;
    private final DatabaseUserDetailsService userDetailsService;
    private final SecurityErrorWriter errorWriter;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Login/register không cần access token. Refresh/logout tự xử lý refresh cookie.
        // API danh mục công khai cũng không cần bước xác thực JWT này.
        return PUBLIC_AUTH_PATHS.contains(request.getRequestURI())
                || ("GET".equals(request.getMethod()) && "/api/v1/categories".equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // Bước 1: lấy access token từ cookie do trình duyệt hoặc Postman gửi lên.
        String accessToken = cookieService.read(request, AuthCookieService.ACCESS_TOKEN);
        if (accessToken == null) {
            // Chưa có token: cho request đến bước phân quyền.
            // Nếu URL cần đăng nhập, Spring sẽ trả 401 qua AuthenticationEntryPoint.
            filterChain.doFilter(request, response);
            return;
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            // Request đã có Authentication thì không tạo lại.
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Bước 2: xác minh chữ ký, thời hạn, loại token và lấy claims một lần.
            var claims = jwtService.verifyAndExtract(accessToken, TokenType.ACCESS);
            // Bước 3: dùng email trong sub để tải user và quyền hiện tại từ database.
            AuthenticatedUser principal = userDetailsService.loadUserByUsername(claims.getSubject());
            if (!jwtService.verifyUser(claims, principal)) {
                throw new JwtException("User account is inactive");
            }
            // Bước 4: tạo đối tượng xác thực nội bộ của Spring, không phải chuỗi JWT.
            // credentials = null vì request này dùng JWT, không gửi lại mật khẩu.
            var authentication = UsernamePasswordAuthenticationToken.authenticated(
                    principal,
                    null,
                    principal.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            // Bước 5: đưa user đã xác thực vào SecurityContext của request hiện tại.
            // Spring lấy quyền để kiểm tra hasRole; controller đọc user qua @AuthenticationPrincipal.
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
        } catch (JwtException | IllegalArgumentException | UsernameNotFoundException exception) {
            // Token sai/hết hạn hoặc user không còn hợp lệ: trả lỗi và dừng request.
            SecurityContextHolder.clearContext();
            errorWriter.write(response, ErrorCode.TOKEN_EXPIRED);
            return;
        }
        // Bước 6: tiếp tục qua các filter phân quyền rồi mới đến controller.
        filterChain.doFilter(request, response);
    }
}
