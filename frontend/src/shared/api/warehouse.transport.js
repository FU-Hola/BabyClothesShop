import axios from "axios";
import authenticatedClient from "./axiosClient.js";

export async function warehouseRequest({ url, ...config }) {
    try {
        const response = await authenticatedClient.request({
            ...config,
            url: (import.meta.env.VITE_WAREHOUSE_API_URL || "/warehouse-staff") + url,
        });
        if (!response.success) {
            throw Object.assign(new Error(response.message || "Yêu cầu không thành công."), {
                status: response.status, fields: response.errors, requestId: response.requestId,
            });
        }
        return response.data;
    } catch (error) {
        if (axios.isCancel(error)) throw error;
        const body = error.response?.data;
        throw Object.assign(new Error(body?.message || error.message || "Không thể kết nối máy chủ."), {
            status: error.response?.status || error.status,
            fields: body?.errors || error.fields,
            requestId: body?.requestId || error.requestId,
        });
    }
}

export function warehousePage(url, params, signal) {
    return warehouseRequest({
        method: "GET", url, signal,
        params: Object.fromEntries(Object.entries(params).filter(
            ([, value]) => value !== "" && value != null,
        )),
    });
}
