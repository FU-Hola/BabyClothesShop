package com.fptu.project_group2.catalogstock.controller;

import com.fptu.project_group2.catalogstock.dto.request.ProductSearchRequest;
import com.fptu.project_group2.catalogstock.dto.response.ProductListResponse;
import com.fptu.project_group2.catalogstock.service.IProduct;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/store-staff/products")
public class ProductController {
    private final IProduct productService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductListResponse>>> searchProducts(@ModelAttribute ProductSearchRequest request) {
        Page<ProductListResponse> products = productService.searchProducts(request);
        PageResponse<ProductListResponse> response = PageResponse.of(products);
        response.setPage(products.getNumber() + 1);
        return ResponseBuilder.ok(response, "Lấy danh sách sản phẩm thành công");
    }
}
