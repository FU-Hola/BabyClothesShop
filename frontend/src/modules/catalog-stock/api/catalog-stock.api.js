import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_CATALOG_API_URL || "/catalog-api",
    timeout: 30000,
});

const stocksPath = "/warehouse-staff/stocks";
const productsPath = "/store-staff/products";
const imagePath = (productId) => `${productsPath}/${productId}/images`;
const uuidPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function staffHeaders() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const localStaffId = import.meta.env.DEV ? import.meta.env.VITE_CATALOG_DEV_STAFF_ID : undefined;
    const staffId = uuidPattern.test(user?.id ?? "") ? user.id : localStaffId;

    if (!uuidPattern.test(staffId ?? "")) {
        throw new Error("Cần tài khoản Store Staff có UUID hợp lệ để lưu dữ liệu.");
    }

    return { "X-User-Id": staffId };
}

export function catalogError(error) {
    if (error.response?.status === 413) {
        return "Ảnh vượt quá giới hạn dung lượng cho phép.";
    }
    const response = error.response?.data;
    const fieldError = Object.values(response?.errors ?? {})[0];
    return fieldError || response?.message || error.message || "Không thể kết nối backend.";
}

export async function getCategories() {
    return (await client.get("/categories")).data.data;
}

export async function getProducts(params) {
    return (await client.get(productsPath, { params })).data.data;
}

export async function getProduct(productId) {
    return (await client.get(`${productsPath}/${productId}`)).data.data;
}

export async function createProduct(product) {
    return (await client.post(productsPath, product, { headers: staffHeaders() })).data.data;
}

export async function updateProduct(productId, product) {
    await client.put(`${productsPath}/${productId}`, product, { headers: staffHeaders() });
}

export async function getProductImages(productId) {
    return (await client.get(imagePath(productId))).data.data;
}

export async function uploadProductImage(productId, formData) {
    await client.post(imagePath(productId), formData, { headers: staffHeaders() });
}

export async function deleteProductImage(productId, imageId) {
    await client.delete(`${imagePath(productId)}/${imageId}`, { headers: staffHeaders() });
}

export async function updateProductImageOrder(productId, imageId, sortOrder) {
    await client.patch(`${imagePath(productId)}/${imageId}/sort-order`, { sortOrder }, {
        headers: staffHeaders(),
    });
}

export async function getStocks(params, signal) {
    return (await client.get(stocksPath, { params, signal })).data.data;
}

export async function getStockSummary() {
    return (await client.get(`${stocksPath}/summary`)).data.data;
}
