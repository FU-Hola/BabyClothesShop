package com.fptu.project_group2.authaccount.repository;

import com.fptu.project_group2.authaccount.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    // Khóa dòng user đến hết transaction để login và refresh không cập nhật chồng nhau.
    // Đây là khóa dữ liệu trong DB, không phải cơ chế quản lý phiên đăng nhập.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") UUID id);

    // Tìm bằng hash và khóa dòng: hai request đồng thời không cùng dùng lại token cũ.
    // Query dùng tên entity User và thuộc tính Java, không dùng tên cột SQL.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.refreshTokenHash = :hash")
    Optional<User> findByRefreshTokenHashForUpdate(@Param("hash") String hash);
}
