package com.fptu.project_group2.catalogstock.repository;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {

    @Lock(LockModeType.OPTIMISTIC_FORCE_INCREMENT)
    Optional<Product> findWithVersionIncrementById(UUID id);

    @Query("""
            select p
            from Product p
            where (
                lower(p.name) like :keyword
                or lower(p.description) like :keyword
                or exists (
                    select v.id
                    from ProductVariant v
                    where v.product = p
                      and lower(v.sku) like :keyword
                )
            )
            and (:categoryId is null or p.category.id = :categoryId)
            and (:status is null or p.status = :status)
            """)
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryId") UUID categoryId,
            @Param("status") ProductStatus status,
            Pageable pageable
    );

    @Query("""
            select p
            from Product p
            join p.category c
            where p.status = com.fptu.project_group2.catalogstock.common.ProductStatus.ACTIVE
              and c.active = true
              and (:slug is null or c.slug = :slug)
              and (
                :keyword = ''
                or lower(p.name) like concat('%', :keyword, '%')
                or lower(p.description) like concat('%', :keyword, '%')
                or exists (
                    select v.id
                    from ProductVariant v
                    where v.product = p
                      and v.active = true
                      and lower(v.sku) like concat('%', :keyword, '%')
                )
              )
            order by p.createdAt desc, p.id desc
            """)
    List<Product> findPublicCatalog(@Param("slug") String slug, @Param("keyword") String keyword);
}
