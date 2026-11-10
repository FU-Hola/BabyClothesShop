import { idempotentRequest } from "../../../shared/api/idempotentRequest.js";
import client from "../../../shared/api/axiosClient.js";

const orderApi = {
    async getOrders(params) {
        const response = await client.get("/store-staff/orders", { params });
        return response.data;
    },
    async getOrder(id) {
        const response = await client.get(`/store-staff/orders/${id}`);
        return response.data;
    },
    async confirmOrder(id) {
        const response = await idempotentRequest(`order:confirm:${id}`, null, (headers) => client.patch(`/store-staff/orders/${id}/confirm`, null, { headers }));
        return response.data;
    },
    async deliverOrder(id) {
        const response = await idempotentRequest(`order:deliver:${id}`, null, (headers) => client.patch(`/store-staff/orders/${id}/deliver`, null, { headers }));
        return response.data;
    },
};

export default orderApi;
