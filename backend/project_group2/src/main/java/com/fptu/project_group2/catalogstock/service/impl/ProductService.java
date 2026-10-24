package com.fptu.project_group2.catalogstock.service.impl;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.dto.request.CreateProductRequest;
import com.fptu.project_group2.catalogstock.dto.request.ProductSearchRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductListResponse;
import com.fptu.project_group2.catalogstock.entity.Category;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductVariant;
import com.fptu.project_group2.catalogstock.repository.CategoryRepository;
import com.fptu.project_group2.catalogstock.repository.ProductRepository;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.catalogstock.service.IProduct;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductService implements IProduct {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> searchProducts(ProductSearchRequest request) {
        String keyword = request.getKeyword() == null ? "" : request.getKeyword().trim().toLowerCase(Locale.ROOT);
        keyword = "%" + keyword + "%";
        Sort sort = Sort.by(request.getSortDirection(), "createdAt", "id");
        Pageable pageable = request.toPageable(sort);
        Page<Product> products = productRepository.searchProducts(keyword, request.getCategoryId(), request.getStatus(), pageable);
        return products.map(this::toResponse);
    }

    @Override
    @Transactional
    public UUID createProduct(CreateProductRequest request, UUID userId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));
        if (!category.isActive()) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã ngừng hoạt động");
        }
        User creator = entityManager.find(User.class, userId);
        if (creator == null) {
            throw new NotFoundException("Không tìm thấy người tạo sản phẩm");
        }
        if (creator.getRole() != UserRole.STORE_STAFF || creator.getStatus() != UserStatus.ACTIVE || creator.getDeletedAt() != null) {
            throw new BaseBusinessException(ErrorCode.ACCESS_DENIED, "Tài khoản không được phép tạo sản phẩm");
        }
        validateVariants(request.getVariants());
        Product product = toProduct(request, category, creator);
        for (CreateProductRequest.VariantRequest item : request.getVariants()) {
            product.addProductVariant(toVariant(item));
        }
        Product savedProduct = productRepository.save(product);
        return savedProduct.getId();
    }

    private Product toProduct(CreateProductRequest request, Category category, User creator) {
        Product product = new Product();
        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setCategory(category);
        product.setCreatedBy(creator);
        product.setStatus(ProductStatus.ACTIVE);
        return product;
    }

    private ProductVariant toVariant(CreateProductRequest.VariantRequest request) {
        ProductVariant variant = new ProductVariant();
        variant.setSku(request.getSku().trim());
        variant.setColor(request.getColor().trim());
        variant.setSize(request.getSize().trim());
        variant.setPrice(request.getPrice());
        variant.setOriginalPrice(request.getOriginalPrice());
        variant.setActive(true);
        return variant;
    }

    private void validateVariants(List<CreateProductRequest.VariantRequest> variants) {
        Set<String> skus = new HashSet<>();
        Set<List<String>> colorSizes = new HashSet<>();

        for (CreateProductRequest.VariantRequest item : variants) {
            String sku = item.getSku().trim().toLowerCase(Locale.ROOT);

            if (!skus.add(sku)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "SKU bị trùng trong danh sách biến thể: " + item.getSku());
            }

            if (productVariantRepository.existsBySkuIgnoreCase(sku)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "SKU đã tồn tại: " + item.getSku());
            }

            String color = item.getColor().trim().toLowerCase(Locale.ROOT);
            String size = item.getSize().trim().toLowerCase(Locale.ROOT);

            if (!colorSizes.add(List.of(color, size))) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Biến thể bị trùng màu và size");
            }

            if (item.getOriginalPrice() != null && item.getOriginalPrice().compareTo(item.getPrice()) < 0) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Giá trước giảm không được nhỏ hơn giá bán");
            }
        }
    }

    private ProductListResponse toResponse(Product product) {
        List<BigDecimal> prices = product.getVariants()
                .stream()
                .filter(ProductVariant::isActive)
                .map(ProductVariant::getPrice)
                .toList();
        BigDecimal minPrice = prices.stream().min(BigDecimal::compareTo).orElse(null);
        BigDecimal maxPrice = prices.stream().max(BigDecimal::compareTo).orElse(null);
        return ProductListResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .build();
    }

}
