package com.fptu.project_group2.warehouse.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.PagingRequest;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ReceiptOptionSearchRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptProductOptionResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptVariantOptionResponse;
import com.fptu.project_group2.warehouse.service.IReceiptOptions;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

@RestController
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff/receipt-options")
public class ReceiptOptionsController {
    private final IReceiptOptions options;

    // Dropdown product tìm kiếm/phân trang; không tải toàn bộ catalog kèm variants.
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PageResponse<ReceiptProductOptionResponse>>> products(
            @Valid @ModelAttribute ReceiptOptionSearchRequest request,
            @ModelAttribute PagingRequest pagingRequest
    ) {
        return ResponseBuilder.ok(options.products(
                request.keyword(), pagingRequest.toPageable(Sort.by("name", "id"))
        ));
    }

    // Chỉ tải danh sách variants sau khi người dùng chọn một product.
    @GetMapping("/products/{productId}/variants")
    public ResponseEntity<ApiResponse<List<ReceiptVariantOptionResponse>>> variants(
            @PathVariable UUID productId
    ) {
        return ResponseBuilder.ok(options.variants(productId));
    }
}
