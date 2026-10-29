package com.fptu.project_group2.authaccount.security;

import com.fptu.project_group2.authaccount.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Tải user từ database cho cả đăng nhập bằng mật khẩu và xác thực JWT.
 * Lớp này không so sánh mật khẩu; DaoAuthenticationProvider làm việc đó bằng BCrypt.
 */
@Service
@RequiredArgsConstructor
public class DatabaseUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm email không phân biệt hoa/thường rồi chuyển entity thành UserDetails.
        return userRepository.findByEmailIgnoreCase(email)
                .map(AuthenticatedUser::from)
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
    }
}
