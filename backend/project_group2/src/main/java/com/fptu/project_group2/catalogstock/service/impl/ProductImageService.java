package com.fptu.project_group2.catalogstock.service.impl;

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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductImageService implements IProductImage {

    private static final int MAX_IMAGES_PER_COLOR = 3;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductImageRepository productImageRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public ProductImageResponse uploadImage(UUID productId, UploadProductImageRequest request) {
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

        if (productImageRepository.countByProductIdAndColorIgnoreCase(productId, color) >= MAX_IMAGES_PER_COLOR) {
            throw tooManyImagesException();
        }

        CloudinaryUploadResponse uploaded = cloudinaryService.uploadImage(request.getFile());

        ProductImage image = new ProductImage();
        image.setProduct(product);
        image.setImageUrl(uploaded.getImageUrl());
        image.setPublicId(uploaded.getPublicId());
        image.setColor(color);
        image.setSortOrder(request.getSortOrder());

        ProductImage savedImage;
        try {
            savedImage = productImageRepository.saveAndFlush(image);
        } catch (RuntimeException exception) {
            log.error("Không thể lưu ảnh cho sản phẩm {}", productId, exception);
            deleteFromCloudinaryQuietly(uploaded.getPublicId());
            throw new BaseBusinessException(ErrorCode.DATABASE_ERROR, "Không thể lưu thông tin ảnh sản phẩm");
        }

        long imageCountAfterSave = productImageRepository.countByProductIdAndColorIgnoreCase(productId, color);
        if (imageCountAfterSave > MAX_IMAGES_PER_COLOR) {
            productImageRepository.delete(savedImage);
            deleteFromCloudinaryQuietly(uploaded.getPublicId());
            throw tooManyImagesException();
        }

        return toProductImageResponse(savedImage);
    }

    private BaseBusinessException tooManyImagesException() {
        return new BaseBusinessException(ErrorCode.VALIDATION_FAILED,
                "Mỗi màu chỉ được tối đa " + MAX_IMAGES_PER_COLOR + " ảnh");
    }

    private void deleteFromCloudinaryQuietly(String publicId) {
        try {
            cloudinaryService.deleteImage(publicId);
        } catch (RuntimeException cleanupException) {
            log.error("Cần dọn ảnh Cloudinary chưa được lưu vào database: {}", publicId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductImageResponse> getImages(UUID productId) {
        if (!productRepository.existsById(productId)) {
            throw new NotFoundException("Không tìm thấy sản phẩm");
        }

        return productImageRepository.findAllByProductIdOrderBySortOrderAscCreatedAtAscIdAsc(productId)
                .stream()
                .map(this::toProductImageResponse)
                .toList();
    }

    @Override
    public void deleteImage(UUID productId, UUID imageId) {
        ProductImage image = findProductImage(productId, imageId);

        if (StringUtils.hasText(image.getPublicId())) {
            cloudinaryService.deleteImage(image.getPublicId());
        }

        try {
            productImageRepository.deleteById(imageId);
        } catch (DataAccessException exception) {
            log.error("Không thể xóa bản ghi ảnh {}", imageId, exception);
            throw new BaseBusinessException(ErrorCode.DATABASE_ERROR, "Không thể xóa thông tin ảnh sản phẩm");
        }
    }

    @Override
    @Transactional
    public ProductImageResponse updateSortOrder(UUID productId, UUID imageId, int sortOrder) {
        ProductImage image = findProductImage(productId, imageId);
        image.setSortOrder(sortOrder);
        return toProductImageResponse(image);
    }

    private ProductImage findProductImage(UUID productId, UUID imageId) {
        return productImageRepository.findByIdAndProductId(imageId, productId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ảnh của sản phẩm"));
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
