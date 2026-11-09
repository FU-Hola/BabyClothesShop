package com.fptu.project_group2.catalogstock.service;

import com.fptu.project_group2.cartcheckout.service.IStockService;
import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.dto.response.CatalogProductResponse;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.catalogstock.repository.ProductRepository;
import com.fptu.project_group2.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CatalogService {
    private final ProductRepository productRepository;
    private final IStockService stockService;

    @Transactional(readOnly = true)
    public List<CatalogProductResponse> list(String slug, String keyword, String sort) {
        String normalizedSlug = blankToNull(slug);
        String normalizedKeyword = keyword == null ? "" : keyword.trim().toLowerCase(Locale.ROOT);
        List<CatalogProductResponse> products = productRepository.findPublicCatalog(normalizedSlug, normalizedKeyword)
                .stream()
                .map(this::toResponse)
                .filter(product -> !product.getVariants().isEmpty())
                .toList();
        return sort(products, sort);
    }

    @Transactional(readOnly = true)
    public CatalogProductResponse get(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        if (!product.getCategory().isActive()) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }
        CatalogProductResponse response = toResponse(product);
        if (response.getVariants().isEmpty() || product.getStatus() != ProductStatus.ACTIVE) {
            throw new NotFoundException("Sản phẩm không còn kinh doanh");
        }
        return response;
    }

    private CatalogProductResponse toResponse(Product product) {
        List<CatalogProductResponse.CatalogVariantResponse> variants = product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .sorted(Comparator.comparing(ProductVariant::getColor).thenComparing(ProductVariant::getSize))
                .map(variant -> CatalogProductResponse.CatalogVariantResponse.builder()
                        .id(variant.getId())
                        .sku(variant.getSku())
                        .color(variant.getColor())
                        .size(variant.getSize())
                        .price(variant.getPrice())
                        .originalPrice(variant.getOriginalPrice())
                        .availableStock(stockService.getAvailableStock(variant.getId()))
                        .build())
                .toList();
        BigDecimal minPrice = variants.stream().map(CatalogProductResponse.CatalogVariantResponse::getPrice)
                .min(BigDecimal::compareTo).orElse(null);
        BigDecimal maxPrice = variants.stream().map(CatalogProductResponse.CatalogVariantResponse::getPrice)
                .max(BigDecimal::compareTo).orElse(null);
        Comparator<ProductImage> imageOrder = Comparator.comparingInt(ProductImage::getSortOrder)
                .thenComparing(ProductImage::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(ProductImage::getId);
        String imageUrl = product.getImages().stream()
                .min(imageOrder)
                .map(ProductImage::getImageUrl)
                .orElse(null);
        return CatalogProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryName(product.getCategory().getName())
                .categorySlug(product.getCategory().getSlug())
                .imageUrl(imageUrl)
                .images(product.getImages().stream()
                        .sorted(imageOrder)
                        .map(image -> CatalogProductResponse.CatalogImageResponse.builder()
                                .id(image.getId())
                                .imageUrl(image.getImageUrl())
                                .color(image.getColor())
                                .sortOrder(image.getSortOrder())
                                .build())
                        .toList())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .variants(variants)
                .build();
    }

    private List<CatalogProductResponse> sort(List<CatalogProductResponse> products, String sort) {
        if ("price-asc".equals(sort)) {
            return products.stream()
                    .sorted(Comparator.comparing(CatalogProductResponse::getMinPrice, Comparator.nullsLast(BigDecimal::compareTo)))
                    .toList();
        }
        if ("price-desc".equals(sort)) {
            return products.stream()
                    .sorted(Comparator.comparing(CatalogProductResponse::getMinPrice, Comparator.nullsLast(BigDecimal::compareTo)).reversed())
                    .toList();
        }
        return products;
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
