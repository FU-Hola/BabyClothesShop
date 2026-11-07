package com.fptu.project_group2.catalogstock.controller;

import com.fptu.project_group2.catalogstock.dto.response.CatalogProductResponse;
import com.fptu.project_group2.catalogstock.service.CatalogService;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/catalog/products")
public class CatalogController {
    private final CatalogService catalogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CatalogProductResponse>>> list(
            @RequestParam(required = false) String slug,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort
    ) {
        return ResponseBuilder.ok(catalogService.list(slug, keyword, sort), "Lấy danh sách sản phẩm thành công");
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<CatalogProductResponse>> get(@PathVariable UUID productId) {
        return ResponseBuilder.ok(catalogService.get(productId), "Lấy chi tiết sản phẩm thành công");
    }
}
