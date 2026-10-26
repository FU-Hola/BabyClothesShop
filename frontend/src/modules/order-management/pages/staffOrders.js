import { orders as customerExamples } from "../../../app/pages/Orders/orders";

export const STATUS = {
    pending: { label: "Chờ xác nhận", next: "confirmed", action: "Confirm Order", actionVi: "Xác nhận đơn hàng" },
    confirmed: { label: "Đã xác nhận", next: "shipping", action: "Mark as Shipped", actionVi: "Đánh dấu đã gửi hàng" },
    shipping: { label: "Đang giao", next: "delivered", action: "Confirm Delivery", actionVi: "Xác nhận đã giao hàng" },
    delivered: { label: "Đã giao" },
    cancelled: { label: "Đã hủy" },
};

const initialOrders = [
    {
        ...customerExamples[0], id: "BCS-20261017-005", placedAt: "17/10/2026", statusType: "pending",
        receiver: { name: "Trần Ngọc Linh", phone: "091 234 5678", address: "28 Nguyễn Trãi, Thanh Xuân, Hà Nội" },
    },
    {
        ...customerExamples[1], id: "BCS-20261016-004", placedAt: "16/10/2026", statusType: "confirmed",
        receiver: { name: "Lê Hoàng Phúc", phone: "098 765 4321", address: "105 Lê Lợi, Quận 1, TP. Hồ Chí Minh" },
    },
    ...customerExamples,
];

const intialProduct = [
    {

    }
]
const STORAGE_KEY = "baby-clothes-shop-staff-order-statuses";

export function loadStaffOrders() {
    let saved = {};
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) saved = parsed;
    } catch {
        // Damaged or unavailable browser storage should not block the prototype.
    }

    return initialOrders.map((order) => {
        const statusType = STATUS[saved[order.id]] ? saved[order.id] : order.statusType;
        return { ...order, statusType, status: STATUS[statusType].label };
    });
}

export function saveStaffStatus(id, statusType) {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...(saved && typeof saved === "object" ? saved : {}), [id]: statusType }));
    } catch {
        // The current view remains interactive even when storage is disabled.
    }
}
