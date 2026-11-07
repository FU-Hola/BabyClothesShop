import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";

export function needsReconciliation(error) {
    return (
        error?.status === 409 ||
        error?.status === 0 ||
        error?.status >= 500 ||
        error?.kind === "contract"
    );
}

// Tách kết quả ghi và lỗi tải lại: GET lỗi sau POST thành công không được coi là POST thất bại.
export async function performWarehouseWrite(client, api, resource, id, { action, body }) {
    const operations =
        resource === "receipt"
            ? {
                  create: () => api.createReceipt(body),
                  confirm: () => api.confirmReceipt(id, body),
                  cancel: () => api.cancelReceipt(id, body),
              }
            : {
                  start: () => api.startPicking(id, body),
                  picking: () => api.updatePicking(id, body),
                  pack: () => api.packIssue(id, body),
                  export: () => api.exportIssue(id, body),
                  cancel: () => api.cancelIssue(id, body),
                  recreate: () => api.recreateIssue(id, body),
              };
    if (!operations[action]) throw new Error("Thao tác kho không hợp lệ");
    if (id)
        await client.cancelQueries({ queryKey: warehouseKeys.detail(resource, id), exact: true });

    const data = await operations[action]();
    const queryKeys = [
        resource === "receipt" ? warehouseKeys.receiptLists : warehouseKeys.issueLists,
    ];
    try {
        if (resource === "receipt" && id) queryKeys.push(warehouseKeys.detail(resource, id));
        if (resource === "issue") {
            // Recreate trả ID khác: chỉ ghi đúng cache của phiếu được trả về.
            await client.cancelQueries({
                queryKey: warehouseKeys.detail(resource, data.id),
                exact: true,
            });
            client.setQueryData(warehouseKeys.detail(resource, data.id), data);
        }
        if (
            (resource === "receipt" && action === "confirm") ||
            (resource === "issue" && action === "export")
        ) {
            queryKeys.push(
                warehouseKeys.inventory,
                warehouseKeys.statistics,
                warehouseKeys.options,
            );
        }
        const refreshes = await Promise.allSettled(
            queryKeys.map((queryKey) =>
                client.invalidateQueries({ queryKey }, { throwOnError: true }),
            ),
        );
        return { data, refreshFailed: refreshes.some((result) => result.status === "rejected") };
    } catch {
        return { data, refreshFailed: true };
    }
}
