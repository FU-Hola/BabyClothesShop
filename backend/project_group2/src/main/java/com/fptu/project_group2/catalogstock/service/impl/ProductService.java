package com.fptu.project_group2.catalogstock.service.impl;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.catalogstock.common.ProductStatus;
import com.fptu.project_group2.catalogstock.dto.request.CreateProductRequest;
import com.fptu.project_group2.catalogstock.dto.request.ProductSearchRequest;
import com.fptu.project_group2.catalogstock.dto.request.UpdateProductRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductDetailResponse;
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
import com.fptu.project_group2.warehouse.entity.Inventory;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService implements IProduct {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final EntityManager entityManager;
    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ProductListResponse> searchProducts(ProductSearchRequest request) {
        String keyword = request.getKeyword() == null ? "" : request.getKeyword().trim().toLowerCase(Locale.ROOT);
        keyword = "%" + keyword + "%";
        Sort sort = Sort.by(request.getSortDirection(), "createdAt", "id");
        Pageable pageable = request.toPageable(sort);
        Page<Product> products = productRepository.searchProducts(keyword, request.getCategoryId(), request.getStatus(),
                pageable);
        return products.map(this::toProductListResponse);
    }

    @Override
    @Transactional
    public UUID createProduct(CreateProductRequest request, UUID userId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));
        if (!category.isActive()) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã ngừng hoạt động");
        }
        User creator = getActiveStoreStaff(userId);
        validateVariants(request.getVariants());
        Product product = toProduct(request, category, creator);
        for (CreateProductRequest.VariantRequest item : request.getVariants()) {
            product.addProductVariant(toVariant(item));
        }
        Product savedProduct = productRepository.save(product);
        initializeInventory(savedProduct.getVariants());
        return savedProduct.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductDetailResponse getProductDetail(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));
        return toProductDetailResponse(product);
    }

    @Override
    @Transactional
    public void updateProduct(UUID productId, UpdateProductRequest request, UUID userId) {
        getActiveStoreStaff(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy danh mục"));

        if (!category.isActive()) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Danh mục đã ngừng hoạt động");
        }

        Map<UUID, ProductVariant> existingVariants = product.getVariants()
                .stream()
                .collect(Collectors.toMap(ProductVariant::getId, variant -> variant));

        validateUpdateVariants(product, request.getVariants(), existingVariants);

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription().trim());
        product.setCategory(category);
        product.setStatus(request.getStatus());

        List<ProductVariant> newVariants = new ArrayList<>();

        for (UpdateProductRequest.VariantRequest item : request.getVariants()) {
            ProductVariant variant;

            if (item.getId() != null) {
                variant = existingVariants.get(item.getId());
            } else {
                variant = new ProductVariant();
                variant.setSku(item.getSku().trim());

                product.addProductVariant(variant);
                newVariants.add(variant);
            }

            applyVariantChanges(variant, item);
        }

        if (!newVariants.isEmpty()) {
            List<ProductVariant> savedVariants = productVariantRepository.saveAll(newVariants);

            initializeInventory(savedVariants);
        }
    }

    private User getActiveStoreStaff(UUID userId) {
        User staff = entityManager.find(User.class, userId);

        if (staff == null) {
            throw new NotFoundException("Không tìm thấy nhân viên");
        }

        if (staff.getRole() != UserRole.STORE_STAFF
                || staff.getStatus() != UserStatus.ACTIVE
                || staff.getDeletedAt() != null) {
            throw new BaseBusinessException(ErrorCode.ACCESS_DENIED,
                    "Tài khoản không có quyền thực hiện thao tác này");
        }

        return staff;
    }

    private void initializeInventory(List<ProductVariant> variants) {
        List<Inventory> inventories = variants.stream()
                .map(variant -> Inventory.builder().variantId(variant.getId()).quantity(0L).build())
                .toList();
        inventoryRepository.saveAll(inventories);
    }

    private void applyVariantChanges(ProductVariant variant, UpdateProductRequest.VariantRequest request) {
        variant.setColor(request.getColor().trim());
        variant.setSize(request.getSize().trim());
        variant.setPrice(request.getPrice());
        variant.setOriginalPrice(request.getOriginalPrice());
        variant.setActive(request.getActive());
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

    private ProductListResponse toProductListResponse(Product product) {
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

    private ProductDetailResponse toProductDetailResponse(Product product) {
        List<ProductDetailResponse.VariantResponse> variants = product.getVariants()
                .stream()
                .map(this::toVariantResponse)
                .toList();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .variants(variants)
                .build();
    }

    private ProductDetailResponse.VariantResponse toVariantResponse(ProductVariant variant) {
        return ProductDetailResponse.VariantResponse.builder()
                .id(variant.getId())
                .sku(variant.getSku())
                .color(variant.getColor())
                .size(variant.getSize())
                .price(variant.getPrice())
                .originalPrice(variant.getOriginalPrice())
                .active(variant.isActive())
                .build();
    }

    private void validateVariants(List<CreateProductRequest.VariantRequest> variants) {
        Set<String> skus = new HashSet<>();
        Set<List<String>> colorSizes = new HashSet<>();

        for (CreateProductRequest.VariantRequest item : variants) {
            String sku = item.getSku().trim().toLowerCase(Locale.ROOT);

            if (!skus.add(sku)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "SKU bị trùng trong danh sách biến thể: " + item.getSku());
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
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "Giá trước giảm không được nhỏ hơn giá bán");
            }
        }
    }

    private void validateExistingVariant(ProductVariant variant, UpdateProductRequest.VariantRequest request) {
        if (!variant.getSku().equals(request.getSku().trim())) {
            throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "Không được thay đổi SKU của biến thể");
        }
        boolean colorChanged = !variant.getColor().equals(request.getColor().trim());

        boolean sizeChanged = !variant.getSize().equals(request.getSize().trim());

        if (colorChanged || sizeChanged) {
            boolean hasBusinessHistory = productVariantRepository.existsInGoodsReceipt(
                    variant.getId()) || productVariantRepository.existsInOrder(variant.getId());

            if (hasBusinessHistory) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "Không được thay đổi màu hoặc size của biến thể đã phát sinh nghiệp vụ");
            }
        }
    }

    private void validateUpdateVariants(
            Product product,
            List<UpdateProductRequest.VariantRequest> requests,
            Map<UUID, ProductVariant> existingVariants
    ) {
        Set<UUID> updatedIds = new HashSet<>();
        Set<String> requestSkus = new HashSet<>();

        for (UpdateProductRequest.VariantRequest request : requests) {
            String sku = request.getSku().trim().toLowerCase(Locale.ROOT);

            if (!requestSkus.add(sku)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "SKU bị trùng trong danh sách biến thể: " + request.getSku());
            }

            if (request.getId() != null) {
                ProductVariant variant = existingVariants.get(request.getId());

                if (variant == null) {
                    throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                            "Biến thể không thuộc sản phẩm đang cập nhật");
                }

                if (!updatedIds.add(request.getId())) {
                    throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                            "Một biến thể được gửi nhiều lần trong request");
                }

                validateExistingVariant(variant, request);
            } else if (productVariantRepository.existsBySkuIgnoreCase(sku)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED, "SKU đã tồn tại: " + request.getSku());
            }

            if (request.getOriginalPrice() != null && request.getOriginalPrice().compareTo(request.getPrice()) < 0) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "Giá trước giảm không được nhỏ hơn giá bán");
            }
        }

        Set<List<String>> requestColorSizePairs = new HashSet<>();

        for (UpdateProductRequest.VariantRequest request : requests) {
            List<String> requestedPair = List.of(request.getColor().trim().toLowerCase(Locale.ROOT),
                    request.getSize().trim().toLowerCase(Locale.ROOT));

            if (!requestColorSizePairs.add(requestedPair)) {
                throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                        "Biến thể bị trùng màu và size trong request");
            }

            for (ProductVariant variant : product.getVariants()) {
                if (Objects.equals(variant.getId(), request.getId())) {
                    continue;
                }

                List<String> existingPair = List.of(variant.getColor().trim().toLowerCase(Locale.ROOT),
                        variant.getSize().trim().toLowerCase(Locale.ROOT));

                if (requestedPair.equals(existingPair)) {
                    throw new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                            "Màu và size đang thuộc một biến thể khác. "
                                    + "Hãy lưu thay đổi của biến thể đó trước");
                }
            }
        }
    }

}
