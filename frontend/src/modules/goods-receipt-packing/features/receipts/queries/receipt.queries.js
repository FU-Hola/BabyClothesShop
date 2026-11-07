import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { receiptApi } from "../api/receipt.api.js";
import { warehouseKeys } from "../../../../../shared/query/warehouse.keys.js";
import { uuidSchema } from "../../../../../shared/schemas/warehouse.schemas.js";

export function useReceipts(params) {
    return useQuery({
        queryKey: [...warehouseKeys.receiptLists, params],
        queryFn: ({ signal }) => receiptApi.receipts(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useReceiptProducts(params) {
    return useQuery({
        queryKey: [...warehouseKeys.options, "products", params],
        queryFn: ({ signal }) => receiptApi.products(params, signal),
        placeholderData: keepPreviousData,
    });
}

export function useReceiptVariants(productId) {
    return useQuery({
        queryKey: [...warehouseKeys.options, "variants", productId],
        queryFn: ({ signal }) => receiptApi.variants(productId, signal),
        enabled: uuidSchema.safeParse(productId).success,
        staleTime: 0,
    });
}
