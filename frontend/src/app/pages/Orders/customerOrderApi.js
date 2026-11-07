import client from "../../../shared/api/axiosClient.js";

export async function getMyOrders(status) {
    const response = await client.get("/orders", {
        params: status ? { status } : undefined,
    });
    return response.data;
}

export async function getMyOrder(orderId) {
    const response = await client.get(`/orders/${orderId}`);
    return response.data;
}
