package com.fptu.project_group2.authaccount.service;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.dto.request.RegisterRequest;
import com.fptu.project_group2.authaccount.dto.response.UserResponse;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.authaccount.repository.UserRepository;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String fullName = request.fullName().trim();
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        validateNormalizedName(fullName);

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(UserRole.CUSTOMER);
        user.setStatus(UserStatus.ACTIVE);

        try {
            return UserResponse.from(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException exception) {
            throw new BaseBusinessException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
    }

    private void validateNormalizedName(String fullName) {
        if (fullName.length() < 2 || fullName.length() > 255) {
            throw new BaseBusinessException(
                    ErrorCode.VALIDATION_FAILED,
                    "Dữ liệu đầu vào không hợp lệ",
                    Map.of("fullName", "Họ và tên phải có từ 2 đến 255 ký tự")
            );
        }
    }
}
