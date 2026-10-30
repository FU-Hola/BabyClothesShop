package com.fptu.project_group2.catalogstock.service;

import com.fptu.project_group2.catalogstock.dto.request.CreateProductRequest;
import com.fptu.project_group2.catalogstock.dto.request.ProductSearchRequest;
import com.fptu.project_group2.catalogstock.dto.request.UpdateProductRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductDetailResponse;
import com.fptu.project_group2.catalogstock.dto.response.ProductListResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface IProduct {
    Page<ProductListResponse> searchProducts(ProductSearchRequest request);

    UUID createProduct(CreateProductRequest request, UUID userId);

    ProductDetailResponse getProductDetail(UUID productId);

    void updateProduct(UUID productId, UpdateProductRequest request, UUID userId);

}
