package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.request.GoodsReceipt.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.GoodsReceiptItemResponse;
import com.fptu.project_group2.warehouse.repository.GoodsReceiptItemRepository;
import com.fptu.project_group2.warehouse.service.IGoodsReceiptItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class GoodsReceiptItemService implements IGoodsReceiptItem {

    private final GoodsReceiptItemRepository goodsReceiptItemRepository;

    @Override
    public void create(List<CreateReceiptRequest.Line> request) {

    }

    @Override
    public PageResponse<GoodsReceiptItemResponse> getAllItems(UUID goodsReceiptId, Pageable pageable) {

        return PageResponse.oneBased(
                goodsReceiptItemRepository.getAllItem(
                        goodsReceiptId, pageable
                )
        );

    }
}
