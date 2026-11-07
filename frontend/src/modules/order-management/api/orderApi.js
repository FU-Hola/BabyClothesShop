import axios from "axios";

// Use Vite's proxy locally so the browser does not need backend CORS configuration.
const client = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_API_URL || "/api/v1",
    timeout: 10000,
});

const orderApi = {
    async getOrders(params) {
        const response = await client.get("/store-staff/orders", { params });
        return response.data.data;
    },
    async getOrder(id) {
        const response = await client.get(`/store-staff/orders/${id}`);
        return response.data.data;
    },

};

export default orderApi;
