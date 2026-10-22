package com.fptu.project_group2.warehouse.service.impl;

import com.fptu.project_group2.warehouse.dto.request.CreateReceiptRequest;
import com.fptu.project_group2.warehouse.repository.GoodsReceiptItemRepository;
import com.fptu.project_group2.warehouse.service.IGoodsReceiptItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
public class GoodsReceiptItemService implements IGoodsReceiptItem {

    private final GoodsReceiptItemRepository goodsReceiptItemRepository;

    @Override
    public void create(List<CreateReceiptRequest.Line> request) {

    }
}
