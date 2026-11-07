import { warehouseTransport } from "../../../../../shared/api/warehouse.transport.js";
import { inventorySchema, statisticsSchema } from "./inventory.contracts.js";

export function createInventoryApi({ request, getPage } = warehouseTransport) {
    return {
        inventory: (params, signal) => getPage("", params, signal, inventorySchema),

        statistics: (signal) =>
            request(
                {
                    method: "GET",
                    url: "/statistics",
                    signal,
                },
                statisticsSchema,
            ),
    };
}

export const inventoryApi = createInventoryApi();
