package com.fptu.project_group2.cartcheckout.repository;

import com.fptu.project_group2.cartcheckout.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartRepository extends JpaRepository<Cart, UUID> {

    Optional<Cart> findByCustomerId(UUID customerId);

    @Query("""
        SELECT DISTINCT c FROM Cart c
        LEFT JOIN FETCH c.items i
        LEFT JOIN FETCH i.variant v
        LEFT JOIN FETCH v.product p
        WHERE c.customer.id = :customerId
    """)
    Optional<Cart> findWithItemsByCustomerId(@Param("customerId") UUID customerId);
}

