package com.fptu.project_group2.authaccount.repository;

import com.fptu.project_group2.authaccount.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface AuthSessionRepository extends JpaRepository<AuthSession, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select session from AuthSession session join fetch session.user where session.id = :id")
    Optional<AuthSession> findByIdForUpdate(@Param("id") UUID id);

    @Query("select session from AuthSession session join fetch session.user where session.id = :id")
    Optional<AuthSession> findByIdWithUser(@Param("id") UUID id);
}
