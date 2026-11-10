package com.fptu.project_group2.warehouse.repository;

import com.fptu.project_group2.warehouse.entity.InventoryLedger;
import org.springframework.data.repository.Repository;

// Ledger is append-only; no update/delete operations are exposed.
public interface InventoryLedgerRepository extends Repository<InventoryLedger, Long> {
    InventoryLedger save(InventoryLedger ledger);
}
