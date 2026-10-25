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
    @Query("select s from AuthSession s join fetch s.user where s.sessionKey = :sessionKey")
    Optional<AuthSession> findBySessionKeyForUpdate(@Param("sessionKey") UUID sessionKey);

    @Query("select s from AuthSession s join fetch s.user where s.sessionKey = :sessionKey")
    Optional<AuthSession> findBySessionKeyWithUser(@Param("sessionKey") UUID sessionKey);
}
