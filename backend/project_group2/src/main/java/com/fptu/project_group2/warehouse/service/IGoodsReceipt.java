package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CancelReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptDetailResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptResponse;
import org.springframework.data.domain.Pageable;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.ReceiptSearchRequest;

import java.util.UUID;

public interface IGoodsReceipt {
    GoodsReceiptDetailResponse getReceipt(UUID id);
    void cancelReceipt(CancelReceiptRequest request, UUID userId, UUID id);

    void createGoodsReceipt(CreateReceiptRequest request, UUID userId);

    void confirmReceipt(ConfirmReceiptRequest request, UUID userId, UUID goodsReceiptId);

    PageResponse<GoodsReceiptResponse> getAllGoodsReceipt(ReceiptSearchRequest request, Pageable pageable);
}
