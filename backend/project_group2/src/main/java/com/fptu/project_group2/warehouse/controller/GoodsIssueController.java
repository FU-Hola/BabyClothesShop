package com.fptu.project_group2.warehouse.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.PagingRequest;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CreateGoodsIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueVersionRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.UpdatePickingRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.PackIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.ExportIssueRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.CancelIssueRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsIssue.GoodsIssueResponse;
import com.fptu.project_group2.warehouse.service.IGoodsIssue;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.ModelAttribute;
import com.fptu.project_group2.warehouse.dto.request.GoodsIssue.IssueSearchRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff/issues")
public class GoodsIssueController {
    private final IGoodsIssue service;

    @PostMapping
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> create(
            @Valid @RequestBody CreateGoodsIssueRequest request
    ) {
        return ResponseBuilder.ok(service.createGoodsIssue(request), "Phiếu xuất của đơn hàng");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GoodsIssueResponse>>> search(
            @Valid @ModelAttribute IssueSearchRequest request,
            @ModelAttribute PagingRequest pagingRequest
    ) {

        Pageable pageable = pagingRequest.toPageable(
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
        return ResponseBuilder.ok(service.search(request, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> detail(
            @PathVariable UUID id
    ) {
        return ResponseBuilder.ok(service.getDetail(id));
    }

    @PostMapping("/{id}/start-picking")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> start(
            @PathVariable UUID id,
            @Valid @RequestBody IssueVersionRequest request
    ) {
        return ResponseBuilder.ok(service.startPicking(id, request));
    }

    @PutMapping("/{id}/picking")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> picking(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePickingRequest request
    ) {
        return ResponseBuilder.ok(service.updatePicking(id, request));
    }

    @PostMapping("/{id}/pack")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> pack(
            @PathVariable UUID id,
            @Valid @RequestBody PackIssueRequest request
    ) {
        return ResponseBuilder.ok(service.pack(id, request));
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> export(
            @PathVariable UUID id,
            @Valid @RequestBody ExportIssueRequest request
    ) {
        return ResponseBuilder.ok(service.export(id, request));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> cancel(
            @PathVariable UUID id,
            @Valid @RequestBody CancelIssueRequest request
    ) {
        return ResponseBuilder.ok(service.cancel(id, request));
    }

    @PostMapping("/{id}/recreate")
    public ResponseEntity<ApiResponse<GoodsIssueDetailResponse>> recreate(
            @PathVariable UUID id,
            @Valid @RequestBody IssueVersionRequest request
    ) {
        return ResponseBuilder.ok(service.recreate(id, request));
    }
}
