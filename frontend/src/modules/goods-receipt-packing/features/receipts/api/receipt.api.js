import { warehouseRequest as request, warehousePage } from "../../../../../shared/api/warehouse.transport.js";

export const receiptApi = {
    products: (params, signal) => warehousePage("/receipt-options/products", params, signal),
    variants: (productId, signal) => request({
        method: "GET", url: `/receipt-options/products/${productId}/variants`, signal,
    }),
    receipts: (params, signal) => warehousePage("/receipts", params, signal),
    receipt: (id, signal) => request({ method: "GET", url: `/receipts/${id}`, signal }),
    createReceipt: (body, key) => request({ method: "POST", url: "/create", data: body, headers: { "Idempotency-Key": key } }),
    confirmReceipt: (id, body, key) => request({ method: "PATCH", url: `/confirm/${id}`, data: body, headers: { "Idempotency-Key": key } }),
    cancelReceipt: (id, body, key) => request({ method: "PATCH", url: `/cancel/${id}`, data: body, headers: { "Idempotency-Key": key } }),
};
