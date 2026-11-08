package com.fptu.project_group2.cartcheckout.service.impl;

import com.fptu.project_group2.cartcheckout.service.IStockService;
import com.fptu.project_group2.warehouse.entity.Inventory;
import com.fptu.project_group2.warehouse.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements IStockService {

    private final InventoryRepository inventoryRepository;

    @Override
    @Transactional(readOnly = true)
    public long getAvailableStock(UUID variantId) {
        return inventoryRepository.findByVariantId(variantId)
                .map(Inventory::getQuantity)
                .orElse(0L);
    }
}
