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
import org.springframework.web.bind.annotation.RequestHeader;
import com.fptu.project_group2.common.service.RequestIdempotency;

@RestController
@PreAuthorize("hasRole('WAREHOUSE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff/issues")
public class GoodsIssueController {
    private final IGoodsIssue service;
    private final RequestIdempotency idempotency;

    @PostMapping
    public ResponseEntity<String> create(
            @RequestHeader("Idempotency-Key") String key,
            @Valid @RequestBody CreateGoodsIssueRequest request
    ) {
        return idempotency.execute(key, "issue:create", request,
                () -> ResponseBuilder.ok(service.createGoodsIssue(request), "Phiếu xuất của đơn hàng"));
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
    public ResponseEntity<String> start(
            @RequestHeader("Idempotency-Key") String key,
            @PathVariable UUID id,
            @Valid @RequestBody IssueVersionRequest request
    ) {
        return idempotency.execute(key, "issue:start:" + id, request,
                () -> ResponseBuilder.ok(service.startPicking(id, request)));
    }

    @PutMapping("/{id}/picking")
    public ResponseEntity<String> picking(
            @RequestHeader("Idempotency-Key") String key,
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePickingRequest request
    ) {
        return idempotency.execute(key, "issue:picking:" + id, request,
                () -> ResponseBuilder.ok(service.updatePicking(id, request)));
    }

    @PostMapping("/{id}/pack")
    public ResponseEntity<String> pack(
            @RequestHeader("Idempotency-Key") String key,
            @PathVariable UUID id,
            @Valid @RequestBody PackIssueRequest request
    ) {
        return idempotency.execute(key, "issue:pack:" + id, request,
                () -> ResponseBuilder.ok(service.pack(id, request)));
    }

    @PostMapping("/{id}/export")
    public ResponseEntity<String> export(
            @RequestHeader("Idempotency-Key") String key,
            @PathVariable UUID id,
            @Valid @RequestBody ExportIssueRequest request
    ) {
        return idempotency.execute(key, "issue:export:" + id, request,
                () -> ResponseBuilder.ok(service.export(id, request)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancel(
            @RequestHeader("Idempotency-Key") String key,
            @PathVariable UUID id,
            @Valid @RequestBody CancelIssueRequest request
    ) {
        return idempotency.execute(key, "issue:cancel:" + id, request,
                () -> ResponseBuilder.ok(service.cancel(id, request)));
    }

}
