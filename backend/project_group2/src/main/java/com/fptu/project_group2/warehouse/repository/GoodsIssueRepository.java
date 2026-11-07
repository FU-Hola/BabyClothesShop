package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.common.GoodsIssueStatus;
import com.fptu.project_group2.warehouse.entity.GoodsIssue;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.UUID;

public interface GoodsIssueRepository extends JpaRepository<GoodsIssue, UUID> {
    // A cancelled issue may have a replacement; shipping uses only the active issue.
    default Optional<GoodsIssue> findByOrderId(UUID orderId) {
        return findFirstByOrderIdAndStatusNot(orderId, GoodsIssueStatus.CANCELLED);
    }
    @EntityGraph(attributePaths = {"order", "items", "items.orderItem", "items.orderItem.variant"})
    @Query("select g from GoodsIssue g where g.id = :id")
    Optional<GoodsIssue> findDetailById(@Param("id") UUID id);

    @Query("select g.order.id from GoodsIssue g where g.id = :id")
    Optional<UUID> findOrderId(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select g from GoodsIssue g where g.id = :id")
    Optional<GoodsIssue> findByIdForUpdate(@Param("id") UUID id);

    Optional<GoodsIssue> findFirstByOrderIdAndStatusNot(UUID orderId, GoodsIssueStatus status);

    boolean existsByOrderId(UUID orderId);

    // Lọc keyword ngay tại DB theo mã phiếu hoặc mã đơn, trước khi phân trang.
    @EntityGraph(attributePaths = {"order", "assignedTo"})
    @Query("""
        select g from GoodsIssue g
        where (:status is null or g.status = :status)
          and (:orderId is null or g.order.id = :orderId)
          and (lower(g.code) like :keyword escape '!'
               or lower(g.order.orderCode) like :keyword escape '!')
        """)
    Page<GoodsIssue> search(@Param("status") GoodsIssueStatus status,
            @Param("orderId") UUID orderId,
            @Param("keyword") String keyword, Pageable pageable);
}
