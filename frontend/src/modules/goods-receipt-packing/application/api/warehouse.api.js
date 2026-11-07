import { createWarehouseTransport } from "../../../../shared/api/warehouse.transport.js";
import { createReceiptApi } from "../../features/receipts/api/receipt.api.js";
import { createIssueApi } from "../../features/issues/api/issue.api.js";

export function createWarehouseApi(client) {
    const transport = createWarehouseTransport(client);
    return {
        ...createReceiptApi(transport),
        ...createIssueApi(transport),
    };
}

export const warehouseApi = createWarehouseApi();
