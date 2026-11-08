package com.fptu.project_group2.cartcheckout.service;

import java.util.UUID;

public interface IStockService {
    /**
     * Tồn hiển thị cho khách là tồn thực tế trong inventory.
     * Tồn chỉ giảm khi phiếu xuất kho chuyển sang EXPORTED.
     */
    long getAvailableStock(UUID variantId);
}

