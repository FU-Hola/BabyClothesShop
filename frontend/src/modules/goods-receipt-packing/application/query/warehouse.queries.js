import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptApi } from "../../features/receipts/api/receipt.api.js";
import { issueApi } from "../../features/issues/api/issue.api.js";
import { uuidSchema } from "../../../../shared/schemas/warehouse.schemas.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";

export function useWarehouseDetail(resource, id) {
    return useQuery({
        queryKey: warehouseKeys.detail(resource, id),
        queryFn: ({ signal }) => resource === "receipt"
            ? receiptApi.receipt(id, signal) : issueApi.issue(id, signal),
        enabled: uuidSchema.safeParse(id).success,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useWarehouseMutation(resource, id) {
    const client = useQueryClient();
    const operations = resource === "receipt" ? {
        create: (body) => receiptApi.createReceipt(body),
        confirm: (body) => receiptApi.confirmReceipt(id, body),
        cancel: (body) => receiptApi.cancelReceipt(id, body),
    } : {
        start: (body) => issueApi.startPicking(id, body),
        picking: (body) => issueApi.updatePicking(id, body),
        pack: (body) => issueApi.packIssue(id, body),
        export: (body) => issueApi.exportIssue(id, body),
        cancel: (body) => issueApi.cancelIssue(id, body),
    };


    return useMutation({
        mutationKey: warehouseKeys.write(resource, id),
        retry: false,
        mutationFn: ({ action, body }) => operations[action](body),
        onSuccess: async (data, { action }) => {
            if (resource === "issue") client.setQueryData(warehouseKeys.detail(resource, id), data);
            const keys = [resource === "receipt" ? warehouseKeys.receiptLists : warehouseKeys.issueLists];
            if (resource === "receipt" && id) keys.push(warehouseKeys.detail(resource, id));
            if (action === "confirm" || action === "export") {
                keys.push(warehouseKeys.options, ["stocks"], ["stock-summary"]);
            }
            await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
        },
    });
}
