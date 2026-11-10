import { useRef } from "react";
import { createWarehouseAttemptKeys } from "../../../../shared/utils/warehouse.idempotency.js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { receiptApi } from "../../features/receipts/api/receipt.api.js";
import { issueApi } from "../../features/issues/api/issue.api.js";
import { idSchema } from "../../../../shared/schemas/warehouse.schemas.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";

export function useWarehouseDetail(resource, id) {
    return useQuery({
        queryKey: warehouseKeys.detail(resource, id),
        queryFn: ({ signal }) => resource === "receipt"
            ? receiptApi.receipt(id, signal) : issueApi.issue(id, signal),
        enabled: idSchema.safeParse(id).success,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });
}

export function useWarehouseMutation(resource, id) {
    const client = useQueryClient();
    const attempts = useRef(null);
    const operations = resource === "receipt" ? {
        create: (body, key) => receiptApi.createReceipt(body, key),
        confirm: (body, key) => receiptApi.confirmReceipt(id, body, key),
        cancel: (body, key) => receiptApi.cancelReceipt(id, body, key),
    } : {
        start: (body, key) => issueApi.startPicking(id, body, key),
        picking: (body, key) => issueApi.updatePicking(id, body, key),
        pack: (body, key) => issueApi.packIssue(id, body, key),
        export: (body, key) => issueApi.exportIssue(id, body, key),
        cancel: (body, key) => issueApi.cancelIssue(id, body, key),
    };


    return useMutation({
        mutationKey: warehouseKeys.write(resource, id),
        retry: false,
        mutationFn: ({ action, body }) => {
            attempts.current ??= createWarehouseAttemptKeys();
            const key = attempts.current.keyFor(`${resource}:${id ?? "new"}:${action}`, body);
            return operations[action](body, key);
        },
        onSuccess: async (data, { action }) => {
            if (resource === "issue") client.setQueryData(warehouseKeys.detail(resource, id), data);
            const keys = [resource === "receipt" ? warehouseKeys.receiptLists : warehouseKeys.issueLists];
            if (id) keys.push(warehouseKeys.detail(resource, id));
            if (action === "confirm" || action === "export") {
                keys.push(warehouseKeys.options, ["stocks"], ["stock-summary"]);
            }
            await Promise.all(keys.map((queryKey) => client.invalidateQueries({ queryKey })));
        },
    });
}
