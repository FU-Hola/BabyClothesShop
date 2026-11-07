import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { warehouseApi } from "../api/warehouse.api.js";
import { uuidSchema } from "../../../../shared/schemas/warehouse.schemas.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";
import { performWarehouseWrite } from "./warehouse.mutations.js";

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
