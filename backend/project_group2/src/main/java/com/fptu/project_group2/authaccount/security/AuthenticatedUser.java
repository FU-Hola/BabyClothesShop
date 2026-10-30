package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * Chuyển dữ liệu User của ứng dụng thành UserDetails mà Spring Security hiểu.
 */
public record AuthenticatedUser(
        UUID id,
        String email,
        String passwordHash,
        UserRole role,
        boolean enabled
) implements UserDetails {
    public static AuthenticatedUser from(User user) {
        // Chỉ tài khoản ACTIVE và chưa bị xóa mềm mới được coi là đang hoạt động.
        return new AuthenticatedUser(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                user.getStatus() == UserStatus.ACTIVE && user.getDeletedAt() == null
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // @PreAuthorize("hasRole('ADMIN')") sẽ tìm GrantedAuthority có tên ROLE_ADMIN.
        // Role này được lấy từ database, không lấy từ dữ liệu client tự gửi.
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getPassword() {
        // Trả hash để BCrypt đối chiếu khi login; không phải mật khẩu gốc.
        return passwordHash;
    }

    @Override
    public String getUsername() {
        // Tên hàm là username theo interface, nhưng dự án dùng email để đăng nhập.
        return email;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
