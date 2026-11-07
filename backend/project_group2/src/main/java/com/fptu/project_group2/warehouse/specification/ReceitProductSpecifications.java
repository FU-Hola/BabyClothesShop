package com.fptu.project_group2.warehouse.specification;

import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.warehouse.entity.Inventory;
import com.fptu.project_group2.warehouse.utils.WarehouseSearch;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

public final class ReceitProductSpecifications {

    private ReceitProductSpecifications(){

    }

    public static Specification<Product> from(String keyword) {
        return (root, query, cb) -> {

            Subquery<Integer> eligibleVariant = query.subquery(Integer.class);
            Root<Inventory> inventory = eligibleVariant.from(Inventory.class);
            Join<Inventory, ProductVariant> variant = inventory.join("variant");
            String pattern = WarehouseSearch.pattern(keyword);

            eligibleVariant.select(cb.literal(1)).where(
                    cb.equal(variant.get("product"), root),
                    cb.isTrue(variant.get("active")),
                    cb.or(
                            cb.like(cb.lower(root.<String>get("name")), pattern, '!'),
                            cb.like(cb.lower(variant.<String>get("sku")), pattern, '!')
                    )
            );

            return cb.and(
                    cb.equal(root.get("status"), ProductStatus.ACTIVE),
                    cb.exists(eligibleVariant)
            );
        };
    }

}
