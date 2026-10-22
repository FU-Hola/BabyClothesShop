package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.warehouse.dto.request.ConfirmReceiptRequest;
import com.fptu.project_group2.warehouse.dto.request.CreateReceiptRequest;

import java.util.UUID;

public interface IGoodsReceipt {

    void createGoodsReceipt(CreateReceiptRequest request, UUID userId);

    void confirmReceipt(ConfirmReceiptRequest request, UUID userId, UUID goodsReceiptId);

}
