package com.fptu.project_group2.ordermanagement.repositories;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fptu.project_group2.ordermanagement.common.OrderStatus;
import com.fptu.project_group2.ordermanagement.common.QueryOrder;
import com.fptu.project_group2.ordermanagement.entity.Order;

public interface OrderRepository extends JpaRepository<Order, UUID> {

    // Pass an empty search string when no search filter is requested.
    @Query(value = QueryOrder.FIND_PAGE_IDS, countQuery = QueryOrder.COUNT_PAGE_IDS)
    Page<UUID> findPageIds(@Param("status") OrderStatus status,
                           @Param("search") String search,
                           Pageable pageable);

    // Fetch items only after paging IDs; collection fetch joins must not be paginated.
    @Query("select distinct o from Order o left join fetch o.items where o.id in :ids")
    List<Order> findAllWithItemsByIdIn(@Param("ids") List<UUID> ids);

    @Query("select o from Order o left join fetch o.items where o.id = :id")
    Optional<Order> findWithItemsById(@Param("id") UUID id);
}
