package com.fptu.project_group2.warehouse.controller;


import com.fptu.project_group2.common.http.ApiResponse;
import com.fptu.project_group2.common.http.ResponseBuilder;
import com.fptu.project_group2.warehouse.common.GoodsReceiptStatus;
import com.fptu.project_group2.warehouse.dto.request.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.service.IGoodsReceipt;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/warehouse-staff")
public class GoodsReceiptController {
    private final IGoodsReceipt goodsReceiptService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Void>> createGoodsReceipt(
            @Valid @RequestBody CreateReceiptRequest request
            ){
        UUID userId = UUID.randomUUID();
        goodsReceiptService.createGoodsReceipt(request, userId);
        return ResponseBuilder.created(null, "Tạo phiếu nhập hàng thành công");
    }

    @PatchMapping("/confirm/{id}")
    public ResponseEntity<ApiResponse<Void>> confirmGoodsReceipt(
            @PathVariable UUID id,
            @Valid @RequestBody ConfirmReceiptRequest request
            ){
        UUID userId = UUID.randomUUID();
        goodsReceiptService.confirmReceipt(request, userId, id);

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
