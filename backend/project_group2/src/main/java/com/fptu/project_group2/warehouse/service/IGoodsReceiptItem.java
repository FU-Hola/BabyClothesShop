package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptItemResponse;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

public interface IGoodsReceiptItem {

    void create(List<CreateReceiptRequest.Line> request);

    PageResponse<GoodsReceiptItemResponse> getAllItems(UUID goodsReceiptId, Pageable pageable);
}
