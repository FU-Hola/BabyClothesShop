package com.fptu.project_group2.ordermanagement.repository;

import com.fptu.project_group2.ordermanagement.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByCheckoutKey(String checkoutKey);

    Optional<Order> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);
}

