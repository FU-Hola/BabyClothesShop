package com.fptu.project_group2.authaccount.dto.response;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

// DTO dành cho màn hình quản lý account, tuyệt đối không trả hash mật khẩu/refresh token.
public record AccountResponse(
        UUID id,
        String fullName,
        String email,
        String phone,
        UserRole role,
        String status,
        String employeeCode,
        String position,
        LocalDate dateOfBirth,
        String gender,
        String address,
        Instant createdAt,
        Instant updatedAt,
        Instant lastLoginAt,
        Instant deletedAt
) {
    public static AccountResponse from(User user) {
        return new AccountResponse(
                user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getRole(),
                user.getStatus() == UserStatus.ACTIVE ? "active" : "blocked",
                user.getEmployeeCode(), user.getPosition(), user.getDateOfBirth(),
                user.getGender() == null ? null : user.getGender().name().toLowerCase(Locale.ROOT),
                user.getAddress(), user.getCreatedAt(), user.getUpdatedAt(), user.getLastLoginAt(), user.getDeletedAt()
        );
    }
}
