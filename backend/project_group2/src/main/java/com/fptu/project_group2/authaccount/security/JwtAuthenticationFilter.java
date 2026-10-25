package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.authaccount.repository.AuthSessionRepository;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.security.SecurityErrorWriter;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private static final Set<String> PUBLIC_AUTH_PATHS = Set.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/v1/auth/refresh",
            "/api/v1/auth/logout"
    );

    private final JwtService jwtService;
    private final AuthSessionRepository sessionRepository;
    private final SecurityErrorWriter errorWriter;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return PUBLIC_AUTH_PATHS.contains(request.getRequestURI())
                || ("GET".equals(request.getMethod()) && "/api/v1/categories".equals(request.getRequestURI()));
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || authorization.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }
        if (!authorization.startsWith("Bearer ") || authorization.length() == 7) {
            errorWriter.write(response, ErrorCode.TOKEN_EXPIRED);
            return;
        }

        try {
            var claims = jwtService.validate(authorization.substring(7), TokenType.ACCESS);
            var session = sessionRepository.findBySessionKeyWithUser(claims.sessionId())
                    .orElseThrow(() -> new JwtException("Authentication session not found"));
            Instant now = Instant.now();
            if (!session.isActiveAt(now) || !session.getUser().getId().equals(claims.userId())) {
                throw new JwtException("Authentication session is inactive");
            }

            AuthenticatedUser principal = AuthenticatedUser.from(session.getUser());
            if (!principal.isEnabled()) {
                throw new JwtException("User account is inactive");
            }
            var authentication = UsernamePasswordAuthenticationToken.authenticated(
                    principal,
                    null,
                    principal.getAuthorities()
            );
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            var context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            filterChain.doFilter(request, response);
        } catch (JwtException exception) {
            SecurityContextHolder.clearContext();
            errorWriter.write(response, ErrorCode.TOKEN_EXPIRED);
        }
    }
}
