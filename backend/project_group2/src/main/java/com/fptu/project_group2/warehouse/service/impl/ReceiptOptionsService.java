package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.repository.ProductRepository;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptProductOptionResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptVariantOptionResponse;
import com.fptu.project_group2.warehouse.service.IReceiptOptions;
import com.fptu.project_group2.warehouse.specification.ReceitProductSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReceiptOptionsService implements IReceiptOptions {
    private final ProductRepository productRepository;
    private final ProductVariantRepository variants;

    @Override
    public PageResponse<ReceiptProductOptionResponse> products(String keyword, Pageable pageable) {
        // Product chỉ xuất hiện khi có SKU đang hoạt động và đã có Inventory.
        return PageResponse.oneBased(productRepository.findAll(
                ReceitProductSpecifications.from(keyword), pageable
        ).map(product -> new ReceiptProductOptionResponse(
                product.getId(), product.getName(), product.getCategory().getName()
        )));
    }

    @Override
    public List<ReceiptVariantOptionResponse> variants(UUID productId) {
        return variants.findReceiptVariants(productId, ProductStatus.ACTIVE);
    }
}
