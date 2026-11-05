package com.fptu.project_group2.catalogstock.service.impl;

import com.fptu.project_group2.authaccount.common.UserRole;
import com.fptu.project_group2.authaccount.common.UserStatus;
import com.fptu.project_group2.authaccount.entity.User;
import com.fptu.project_group2.catalogstock.dto.request.UploadProductImageRequest;
import com.fptu.project_group2.catalogstock.dto.response.CloudinaryUploadResponse;
import com.fptu.project_group2.catalogstock.dto.response.ProductImageResponse;
import com.fptu.project_group2.catalogstock.entity.Product;
import com.fptu.project_group2.catalogstock.entity.ProductImage;
import com.fptu.project_group2.catalogstock.repository.ProductImageRepository;
import com.fptu.project_group2.catalogstock.repository.ProductRepository;
import com.fptu.project_group2.catalogstock.repository.ProductVariantRepository;
import com.fptu.project_group2.catalogstock.service.IProductImage;
import com.fptu.project_group2.common.exception.BaseBusinessException;
import com.fptu.project_group2.common.exception.ErrorCode;
import com.fptu.project_group2.common.exception.NotFoundException;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImageService implements IProductImage {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;
    private final EntityManager entityManager;
    private final TransactionTemplate transactionTemplate;

    @Override
    public ProductImageResponse uploadImage(UUID productId, UploadProductImageRequest request, UUID userId) {
        validateStoreStaff(userId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy sản phẩm"));

        String color = productVariantRepository.findAllByProductId(productId)
                .stream()
                .map(variant -> variant.getColor().trim())
                .filter(variantColor -> variantColor.equalsIgnoreCase(request.getColor().trim()))
                .findFirst()
                .orElseThrow(() -> new BaseBusinessException(
                        ErrorCode.VALIDATION_FAILED,
                        "Màu ảnh không thuộc các biến thể của sản phẩm"
                ));

        CloudinaryUploadResponse uploaded = cloudinaryService.uploadImage(request.getFile());

        try {
            return transactionTemplate.execute(status -> {
                ProductImage image = new ProductImage();
                image.setProduct(product);
                image.setImageUrl(uploaded.getImageUrl());
                image.setPublicId(uploaded.getPublicId());
                image.setColor(color);
                image.setSortOrder(request.getSortOrder());

                ProductImage savedImage = productImageRepository.saveAndFlush(image);
                return toProductImageResponse(savedImage);
            });
        } catch (RuntimeException exception) {
            log.error("Không thể lưu ảnh cho sản phẩm {}", productId, exception);

            try {
                cloudinaryService.deleteImage(uploaded.getPublicId());
            } catch (RuntimeException cleanupException) {
                log.error("Cần dọn ảnh Cloudinary chưa được lưu vào database: {}", uploaded.getPublicId());
            }

            throw new BaseBusinessException(ErrorCode.DATABASE_ERROR, "Không thể lưu thông tin ảnh sản phẩm");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }

        return productImageRepository.findAllByProductIdOrderBySortOrderAscIdAsc(productId)
                .stream()
                .map(this::toProductImageResponse)
                .toList();
    }

    private void validateStoreStaff(UUID userId) {
        User staff = entityManager.find(User.class, userId);

        if (staff == null) {
            throw new NotFoundException("Không tìm thấy nhân viên");
        }

        if (staff.getRole() != UserRole.STORE_STAFF
                || staff.getStatus() != UserStatus.ACTIVE
                || staff.getDeletedAt() != null) {
            throw new BaseBusinessException(
                    ErrorCode.ACCESS_DENIED,
                    "Tài khoản không có quyền thực hiện thao tác này"
            );
        }
    }

    private ProductImageResponse toProductImageResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .productId(image.getProduct().getId())
                .imageUrl(image.getImageUrl())
                .color(image.getColor())
                .sortOrder(image.getSortOrder())
                .build();
    }
}
