import client from "../../../shared/api/axiosClient.js";

export async function getMyOrders() {
    const response = await client.get("/orders");
    return response.data;
}

export async function getMyOrder(orderId) {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
}
