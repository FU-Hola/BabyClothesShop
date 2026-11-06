package com.fptu.project_group2.catalogstock.service;

import com.fptu.project_group2.catalogstock.dto.request.UploadProductImageRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductImageResponse;

import java.util.List;
import java.util.UUID;

public interface IProductImage {

    ProductImageResponse uploadImage(UUID productId, UploadProductImageRequest request, UUID userId);

    List<ProductImageResponse> getImages(UUID productId);
}
