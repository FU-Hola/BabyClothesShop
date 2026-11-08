package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, UUID> {
    List<ProductImage> findAllByProductIdOrderBySortOrderAscCreatedAtAscIdAsc(UUID productId);

    Optional<ProductImage> findByIdAndProductId(UUID id, UUID productId);

    long countByProductIdAndColorIgnoreCase(UUID productId, String color);
}
