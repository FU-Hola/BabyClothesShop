package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.warehouse.dto.request.CreateReceiptRequest;

import java.util.List;

public interface IGoodsReceiptItem {

    void create(List<CreateReceiptRequest.Line> request);
}
