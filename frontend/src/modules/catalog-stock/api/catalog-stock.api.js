import client from "../../../shared/api/axiosClient.js";

const stocksPath = "/warehouse-staff/stocks";
const productsPath = "/store-staff/products";
const imagePath = (productId) => `${productsPath}/${productId}/images`;
export function catalogError(error) {
    if (error.response?.status === 413) {
        return "Ảnh vượt quá giới hạn dung lượng cho phép.";
    }
    const response = error.response?.data;
    const fieldError = Object.values(response?.errors ?? {})[0];
    return fieldError || response?.message || error.message || "Không thể kết nối backend.";
}

export async function getCategories() {
    return (await client.get("/categories")).data;
}

export async function getProducts(params) {
    return (await client.get(productsPath, { params })).data;
}

export async function getProduct(productId) {
    return (await client.get(`${productsPath}/${productId}`)).data;
}

export async function createProduct(product) {
    return (await client.post(productsPath, product)).data;
}

export async function updateProduct(productId, product) {
    await client.put(`${productsPath}/${productId}`, product);
}

export async function getProductImages(productId) {
    return (await client.get(imagePath(productId))).data;
}

export async function uploadProductImage(productId, formData) {
    await client.post(imagePath(productId), formData, { headers: { "Content-Type": undefined } });
}

export async function deleteProductImage(productId, imageId) {
    await client.delete(`${imagePath(productId)}/${imageId}`);
}

export async function updateProductImageOrder(productId, imageId, sortOrder) {
    await client.patch(`${imagePath(productId)}/${imageId}/sort-order`, { sortOrder });
}

export async function getStocks(params, signal) {
    return (await client.get(stocksPath, { params, signal })).data;
}

export async function getStockSummary() {
    return (await client.get(`${stocksPath}/summary`)).data;
}
