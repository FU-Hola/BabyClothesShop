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
        const response = await client.patch(`/store-staff/orders/${id}/confirm`);
        return response.data;
    },
    async shipOrder(id, data) {
        const response = await client.patch(`/store-staff/orders/${id}/ship`, data);
        return response.data;
    },
    async deliverOrder(id) {
        const response = await client.patch(`/store-staff/orders/${id}/deliver`);
        return response.data;
    },
};

export default orderApi;
