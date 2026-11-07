package com.fptu.project_group2.ordermanagement.repository;

import com.fptu.project_group2.ordermanagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.QueryOrder;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByCheckoutKey(String checkoutKey);

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);

    @Query(value = QueryOrder.FIND_PAGE_IDS, countQuery = QueryOrder.COUNT_PAGE_IDS)
    Page<UUID> findPageIds(@Param("status") OrderStatus status,
                           @Param("search") String search,
                           Pageable pageable);

    // Fetch items after paging IDs, not in the paginated query itself.
    @Query("select distinct o from Order o left join fetch o.items where o.id in :ids")
    List<Order> findAllWithItemsByIdIn(@Param("ids") List<UUID> ids);

    @Query("select o from Order o left join fetch o.items where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findByIdForUpdate(@Param("id") UUID id);
}
