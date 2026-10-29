package com.fptu.project_group2.authaccount.entity;

import com.fptu.project_group2.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;
import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 254, unique = true)
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    // Mỗi user chỉ giữ một hash refresh token hiện tại; login/refresh mới sẽ thay hash cũ.
    // JsonIgnore ngăn lộ trường này nếu entity vô tình được chuyển thành JSON.
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "refresh_token_hash", length = 64, unique = true)
    private String refreshTokenHash;

    // Dùng để kiểm tra hạn refresh trong DB; logout đặt cả hai trường về null.
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "refresh_token_expires_at")
    private Instant refreshTokenExpiresAt;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "phone", nullable = true, length = 32)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "employee_code", nullable = true, length = 40, unique = true)
    private String employeeCode;

    @Column(name = "position", nullable = true, length = 100)
    private String position;

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "created_by", nullable = true)
    private User createdBy;

    @Column(name = "deleted_at", nullable = true)
    private Instant deletedAt;
}
