package com.fptu.project_group2.cartcheckout.service;

import java.util.UUID;

public interface IStockService {
    /**
     * Tính số lượng có thể bán = Tồn thực tế (inventory) - Số lượng đang giữ cho đơn (Pending Confirmation, Confirmed, Packed)
     */
    long getAvailableStock(UUID variantId);
}

