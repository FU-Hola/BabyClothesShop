import axios from "axios";
import { WarehouseApiError } from "./WarehouseApiError.js";
import { pageSchema } from "./warehouse.contracts.js";

import authenticatedClient from "./axiosClient.js";

function cleanParams(params) {
    return Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) => value !== "" && value !== null && value !== undefined,
        ),
    );
}

const http = {
    async request(config) {
        const base = import.meta.env.VITE_WAREHOUSE_API_URL || "/warehouse-staff";
        const envelope = await authenticatedClient.request({
            ...config,
            url: base + (config.url.startsWith("/") ? config.url : "/" + config.url),
            timeout: 20_000,
        });
        return {data: envelope, status: envelope.status};
    },
};

export function createWarehouseTransport(client = http) {
    async function request(config, dataSchema) {
        try {
            const response = await client.request(config);
            const envelope = response.data;
            // data trả về sai format
            if (typeof envelope?.success !== "boolean") {
                throw new WarehouseApiError("Phản hồi máy chủ không đúng định dạng.", {
                    status: response.status,
                    kind: "contract",
                });
            }

            // BE trả về kết quả không thành công.
            if (envelope.success !== true) {
                throw new WarehouseApiError(envelope?.message || "Yêu cầu không thành công", {
                    status: envelope?.status || response.status,
                    fields: envelope?.errors,
                    requestId: envelope?.requestId,
                });
            }

            // parse xem đúng với contract hay ko
            const result = dataSchema.safeParse(envelope.data);

            if (!result.success) {
                throw new WarehouseApiError("Dữ liệu trả về không khớp với Warehouse.", {
                    status: response.status,
                    requestId: envelope.requestId,
                    kind: "contract",
                });
            }

            return result.data;
        } catch (error) {
            if (axios.isCancel(error) || error instanceof WarehouseApiError) {
                throw error;
            }

            const body = error.response?.data;

            throw new WarehouseApiError(
                body?.message || "Không thể kết nối máy chủ. Vui lòng kiểm tra lại.",
                {
                    status: error.response?.status || 0,
                    fields: body?.errors,
                    requestId: body?.requestId,
                },
            );
        }
    }

    async function getPage(url, params, signal, schema) {
        const result = await request(
            {
                method: "GET",
                url,
                params: cleanParams(params),
                signal,
            },
            pageSchema(schema),
        );
        return result;
    }

    return { request, getPage };
}

export const warehouseTransport = createWarehouseTransport();
