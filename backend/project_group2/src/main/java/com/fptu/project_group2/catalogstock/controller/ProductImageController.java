package com.fptu.project_group2.catalogstock.controller;

import com.fptu.project_group2.catalogstock.dto.request.UpdateImageSortOrderRequest;
import com.fptu.project_group2.catalogstock.dto.request.UploadProductImageRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductImageResponse;
import com.fptu.project_group2.catalogstock.service.IProductImage;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('STORE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-staff/products/{productId}/images")
public class ProductImageController {

    private final IProductImage productImageService;

    @PatchMapping("/{imageId}/sort-order")
    public ResponseEntity<ApiResponse<ProductImageResponse>> updateSortOrder(
            @PathVariable("productId") UUID productId,
            @PathVariable("imageId") UUID imageId,
            @Valid @RequestBody UpdateImageSortOrderRequest request
    ) {
        ProductImageResponse response = productImageService.updateSortOrder(productId, imageId, request.sortOrder());
        return ResponseBuilder.ok(response, "Cập nhật thứ tự ảnh thành công");
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable("productId") UUID productId,
            @PathVariable("imageId") UUID imageId
    ) {
        productImageService.deleteImage(productId, imageId);
        return ResponseBuilder.ok(null, "Xóa ảnh sản phẩm thành công");
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ProductImageResponse>> uploadImage(
            @PathVariable("productId") UUID productId,
            @Valid @ModelAttribute UploadProductImageRequest request
    ) {
        ProductImageResponse response = productImageService.uploadImage(productId, request);
        return ResponseBuilder.created(response, "Upload ảnh sản phẩm thành công");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductImageResponse>>> getImages(
            @PathVariable("productId") UUID productId
    ) {
        return ResponseBuilder.ok(productImageService.getImages(productId), "Lấy danh sách ảnh sản phẩm thành công");
    }
}
