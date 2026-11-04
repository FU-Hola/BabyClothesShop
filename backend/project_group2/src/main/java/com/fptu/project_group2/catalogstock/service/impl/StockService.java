package com.fptu.project_group2.catalogstock.service.impl;

import com.fptu.project_group2.catalogstock.common.StockStatus;
import com.fptu.project_group2.catalogstock.dto.request.StockSearchRequest;
import com.fptu.project_group2.catalogstock.dto.response.StockResponse;
import com.fptu.project_group2.catalogstock.dto.response.StockSummaryResponse;
import com.fptu.project_group2.catalogstock.entity.Category;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.catalogstock.repository.StockRepository;
import com.fptu.project_group2.catalogstock.service.IStock;
import com.fptu.project_group2.warehouse.entity.Inventory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService implements IStock {

    private final StockRepository stockRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<StockResponse> searchStock(StockSearchRequest request) {
        String keyword = request.getKeyword() == null ? "" : request.getKeyword().trim().toLowerCase(Locale.ROOT);

        keyword = "%" + keyword + "%";

        String variantSize = request.getVariantSize();

        if (variantSize == null || variantSize.isBlank()) {
            variantSize = null;
        } else {
            variantSize = variantSize.trim().toLowerCase(Locale.ROOT);
        }

        Boolean inStock = null;

        if (request.getStatus() != null) {
            inStock = request.getStatus() == StockStatus.IN_STOCK;
        }

        Pageable pageable = request.toPageable(Sort.unsorted());

        Page<Inventory> inventories = stockRepository.searchStock(keyword, request.getCategoryId(), variantSize,
                inStock, pageable);

        List<UUID> variantIds = inventories.getContent().stream().map(Inventory::getVariantId).toList();

        Map<UUID, ProductVariant> variants = productVariantRepository.findAllById(variantIds)
                .stream()
                .collect(Collectors.toMap(ProductVariant::getId, variant -> variant));

        return inventories.map(inventory -> toStockResponse(inventory, variants.get(inventory.getVariantId())));
    }

    @Override
    @Transactional(readOnly = true)
    public StockSummaryResponse getStockSummary() {
        Long totalQuantity = stockRepository.getTotalQuantity();

        return StockSummaryResponse.builder()
                .totalQuantity(totalQuantity)
                .build();
    }

    private StockResponse toStockResponse(
            Inventory inventory,
            ProductVariant variant
    ) {
        Product product = variant.getProduct();
        Category category = product.getCategory();

        StockStatus stockStatus = inventory.getQuantity() > 0 ? StockStatus.IN_STOCK : StockStatus.OUT_OF_STOCK;

        return StockResponse.builder()
                .variantId(variant.getId())
                .productId(product.getId())
                .productName(product.getName())
                .sku(variant.getSku())
                .color(variant.getColor())
                .size(variant.getSize())
                .categoryId(category.getId())
                .categoryName(category.getName())
                .quantity(inventory.getQuantity())
                .stockStatus(stockStatus)
                .build();
    }
}
