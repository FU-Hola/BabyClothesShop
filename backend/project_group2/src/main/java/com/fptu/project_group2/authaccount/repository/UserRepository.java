package com.fptu.project_group2.authaccount.repository;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    Optional<User> findFirstByRole(UserRole role);
}
