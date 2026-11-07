import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { inventoryApi } from "../api/inventory.api.js";
import { warehouseKeys } from "../../../../../shared/query/warehouse.keys.js";

export function useInventory(params) {
    return useQuery({
        queryKey: [...warehouseKeys.inventory, params],
        queryFn: ({ signal }) => inventoryApi.inventory(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useInventoryStatistics() {
    return useQuery({
        queryKey: warehouseKeys.statistics,
        queryFn: ({ signal }) => inventoryApi.statistics(signal),
    });
}
