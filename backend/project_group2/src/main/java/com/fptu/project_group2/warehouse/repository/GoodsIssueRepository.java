package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, UUID> {
    Optional<GoodsIssue> findByOrderId(UUID orderId);
}
