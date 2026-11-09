package com.fptu.project_group2.warehouse.controller;


import com.fptu.project_group2.authaccount.security.AuthenticatedUser;
import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.common.http.PagingRequest;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CancelReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptResponse;
import com.fptu.project_group2.warehouse.service.IGoodsReceipt;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ReceiptSearchRequest;
import com.fptu.project_group2.warehouse.utils.WarehouseActorProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@PreAuthorize("hasAnyRole('STORE_STAFF', 'WAREHOUSE_STAFF')")
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff")
public class GoodsReceiptController {
    private final IGoodsReceipt goodsReceiptService;
    private final WarehouseActorProvider actors;

    @GetMapping("/receipts")
    public ResponseEntity<ApiResponse<PageResponse<GoodsReceiptResponse>>> receipts(
            @Valid @ModelAttribute ReceiptSearchRequest request,
            @ModelAttribute PagingRequest pagingRequest
    ) {
        Pageable pageable = pagingRequest.toPageable(
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
        PageResponse<GoodsReceiptResponse> result = goodsReceiptService.getAllGoodsReceipt(request, pageable);
        return ResponseBuilder.ok(result);
    }

    @GetMapping("/receipts/{id}")
    public ResponseEntity<ApiResponse<GoodsReceiptDetailResponse>> receipt(
            @PathVariable UUID id) {
        return ResponseBuilder.ok(goodsReceiptService.getReceipt(id));
    }

    @PreAuthorize("hasRole('STORE_STAFF')")
    @PatchMapping("/cancel/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable UUID id,
            @Valid @RequestBody CancelReceiptRequest request) {
        goodsReceiptService.cancelReceipt(request, actors.currentActor().getId(), id);
        return ResponseBuilder.ok(null, "Đã hủy phiếu nhập kho");
    }

    @PreAuthorize("hasRole('STORE_STAFF')")
    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createGoodsReceipt(
            @Valid @RequestBody CreateReceiptRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
            ){
        goodsReceiptService.createGoodsReceipt(request, principal.id());
        return ResponseBuilder.created(null, "Tạo phiếu nhập hàng thành công");
    }

    @PreAuthorize("hasRole('WAREHOUSE_STAFF')")
    @PatchMapping("/confirm/{id}")
    public ResponseEntity<ApiResponse<Void>> confirmGoodsReceipt(
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmReceiptRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
            ){
        goodsReceiptService.confirmReceipt(request, principal.id(), id);

        return ResponseBuilder.ok(null, "Xác nhận phiếu nhập kho thành công");
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<Map<String, String>>>> getAllReceiptStatus(){
        List<Map<String, String>> statuses = Arrays.stream(GoodsReceiptStatus.values())
                .map(s -> Map.of(
                        "code", s.getCode(),
                        "label", s.getLabel()
        )).toList();

        return ResponseBuilder.ok(statuses, "Lấy danh sách trạng thái thành công");
    }

}
