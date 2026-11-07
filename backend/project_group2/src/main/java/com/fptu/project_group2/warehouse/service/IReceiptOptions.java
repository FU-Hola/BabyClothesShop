package com.fptu.project_group2.warehouse.service;

import com.fptu.project_group2.common.http.PageResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptProductOptionResponse;
import com.fptu.project_group2.warehouse.dto.response.GoodsReceipt.ReceiptVariantOptionResponse;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

public interface IReceiptOptions {
    PageResponse<ReceiptProductOptionResponse> products(String keyword, Pageable pageable);
    List<ReceiptVariantOptionResponse> variants(UUID productId);
}
