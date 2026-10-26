import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../api/warehouse.api.js";
import { uuidSchema } from "../schema/warehouse.schemas.js";
import { performWarehouseWrite } from "./warehouse.mutations.js";
import { warehouseKeys } from "./warehouse.keys.js";

export function useInventory(params) {
    return useQuery({
        queryKey: [...warehouseKeys.inventory, params],
        queryFn: ({ signal }) => warehouseApi.inventory(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useInventoryStatistics() {
    return useQuery({
        queryKey: warehouseKeys.statistics,
        queryFn: ({ signal }) => warehouseApi.statistics(signal),
    });
}

export function useReceipts(params) {
    return useQuery({
        queryKey: [...warehouseKeys.receiptLists, params],
        queryFn: ({ signal }) => warehouseApi.receipts(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useIssues(params) {
    return useQuery({
        queryKey: [...warehouseKeys.issueLists, params],
        queryFn: ({ signal }) => warehouseApi.issues(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useReceiptProducts(params) {
    return useQuery({
        queryKey: [...warehouseKeys.options, "products", params],
        queryFn: ({ signal }) => warehouseApi.products(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useReceiptVariants(productId) {
    return useQuery({
        queryKey: [...warehouseKeys.options, "variants", productId],
        queryFn: ({ signal }) => warehouseApi.variants(productId, signal),
        enabled: uuidSchema.safeParse(productId).success,
        staleTime: 0,
    });
}

export function useWarehouseDetail(resource, id) {
    return useQuery({
        queryKey: warehouseKeys.detail(resource, id),
        queryFn: ({ signal }) =>
            resource === "receipt"
                ? warehouseApi.receipt(id, signal)
                : warehouseApi.issue(id, signal),
        enabled: uuidSchema.safeParse(id).success,
        // Không ghi đè bản đang chỉnh do đổi tab hoặc reconnect.
        staleTime: 0,
        refetchOnMount: "always",
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useWarehouseMutation(resource, id) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: warehouseKeys.write(resource, id),
        scope: { id: `warehouse:${resource}:${id || "new"}` },
        retry: false,
        mutationFn: (variables) =>
            performWarehouseWrite(queryClient, warehouseApi, resource, id, variables),
    });
}
