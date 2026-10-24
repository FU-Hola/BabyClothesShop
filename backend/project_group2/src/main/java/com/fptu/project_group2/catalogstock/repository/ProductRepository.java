package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    @Query("""
            select p from Product p
            where (
                lower(p.name) like :keyword
                or lower(p.description) like :keyword
                or exists (select v.id from ProductVariant v where v.product=p and lower(v.sku)like :keyword))
            and (:categoryId is null or p.category.id=:categoryId)
            and (:status is null or p.status=:status)
            """)
    Page<Product> searchProducts(@Param("keyword") String keyword, @Param("categoryId") UUID categoryId, @Param("status") ProductStatus status, Pageable pageable);

}
