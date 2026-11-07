import client from "./axiosClient.js";

export async function getCatalogProducts(params) {
    return (await client.get("/catalog/products", { params })).data;
}

export async function getCatalogProduct(productId) {
    return (await client.get(`/catalog/products/${productId}`)).data;
}
