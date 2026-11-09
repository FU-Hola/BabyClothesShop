import { warehouseRequest as request, warehousePage } from "../../../../../shared/api/warehouse.transport.js";

export const receiptApi = {
    products: (params, signal) => warehousePage("/receipt-options/products", params, signal),
    variants: (productId, signal) => request({
        method: "GET", url: `/receipt-options/products/${productId}/variants`, signal,
    }),
    receipts: (params, signal) => warehousePage("/receipts", params, signal),
    receipt: (id, signal) => request({ method: "GET", url: `/receipts/${id}`, signal }),
    createReceipt: (body) => request({ method: "POST", url: "/create", data: body }),
    confirmReceipt: (id, body) => request({ method: "PATCH", url: `/confirm/${id}`, data: body }),
    cancelReceipt: (id, body) => request({ method: "PATCH", url: `/cancel/${id}`, data: body }),
};
