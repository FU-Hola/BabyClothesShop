package com.fptu.project_group2.catalogstock.controller;

import com.fptu.project_group2.catalogstock.dto.request.CreateProductRequest;
import com.fptu.project_group2.catalogstock.dto.request.ProductSearchRequest;
import com.fptu.project_group2.catalogstock.dto.request.UpdateProductRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductDetailResponse;
import com.fptu.project_group2.catalogstock.dto.response.ProductListResponse;
import com.fptu.project_group2.catalogstock.service.IProduct;
import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-staff/products")
public class ProductController {
    private final IProduct productService;

    @PreAuthorize("hasRole('STORE_STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductListResponse>>> searchProducts(@ModelAttribute ProductSearchRequest request) {
        Page<ProductListResponse> products = productService.searchProducts(request);
        return ResponseBuilder.ok(PageResponse.oneBased(products), "Lấy danh sách sản phẩm thành công");
    }

    @PreAuthorize("hasRole('STORE_STAFF')")
    @PostMapping
    public ResponseEntity<ApiResponse<UUID>> createProduct(
            @Valid @RequestBody CreateProductRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UUID productId = productService.createProduct(request, principal.id());
        return ResponseBuilder.created(productId, "Tạo sản phẩm thành công");
    }

    @PreAuthorize("hasRole('STORE_STAFF')")
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductDetail(
            @PathVariable("productId") UUID productId) {
        ProductDetailResponse product = productService.getProductDetail(productId);
        return ResponseBuilder.ok(product, "Lấy chi tiết sản phẩm thành công");
    }

    @PreAuthorize("hasRole('STORE_STAFF')")
    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> updateProduct(
            @PathVariable("productId") UUID productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        productService.updateProduct(productId, request);

        return ResponseBuilder.ok(null, "Cập nhật sản phẩm thành công");
    }
}
