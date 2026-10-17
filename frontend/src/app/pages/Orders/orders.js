// Dữ liệu minh họa cho prototype, chưa lấy từ tài khoản hoặc API.
export const orders = [
    {
        id: "BCS-20261015-001",
        placedAt: "15/10/2026",
        status: "Đang giao",
        statusType: "shipping",
        receiver: {
            name: "Nguyễn Minh Anh",
            phone: "090 000 0000",
            address: "12 Đường Hoa, Hà Nội",
        },
        paymentMethod: "Thanh toán khi nhận hàng",
        shippingFee: 30000,
        items: [
            { id: "shirt-boys", name: "Áo Sơ Mi Tay Dài Bé Trai", brand: "GAP", color: "Pine Tree Print", size: "M", quantity: 1, price: 950000, image: "/products/ao-so-mi-be-trai.jpg" },
            { id: "shirt-girls", name: "Áo Sơ Mi Tay Dài Bé Gái", brand: "GAP", color: "Hồng", size: "S", quantity: 1, price: 399000, image: "/products/ao-so-mi-be-gai.jpg" },
        ],
    },
    {
        id: "BCS-20261008-002",
        placedAt: "08/10/2026",
        status: "Đã giao",
        statusType: "delivered",
        receiver: {
            name: "Nguyễn Minh Anh",
            phone: "090 000 0000",
            address: "12 Đường Hoa, Hà Nội",
        },
        paymentMethod: "Thanh toán khi nhận hàng",
        shippingFee: 0,
        items: [
            { id: "shirt-boys", name: "Áo Sơ Mi Tay Dài Bé Trai", brand: "GAP", color: "Pine Tree Print", size: "L", quantity: 1, price: 950000, image: "/products/ao-so-mi-be-trai.jpg" },
        ],
    },
    {
        id: "BCS-20260930-003",
        placedAt: "30/09/2026",
        status: "Đã hủy",
        statusType: "cancelled",
        receiver: {
            name: "Nguyễn Minh Anh",
            phone: "090 000 0000",
            address: "12 Đường Hoa, Hà Nội",
        },
        paymentMethod: "Thanh toán khi nhận hàng",
        shippingFee: 30000,
        items: [
            { id: "shirt-girls", name: "Áo Sơ Mi Tay Dài Bé Gái", brand: "GAP", color: "Hồng", size: "M", quantity: 1, price: 399000, image: "/products/ao-so-mi-be-gai.jpg" },
        ],
    },
];

export const subtotalOf = (order) =>
    order.items.reduce((total, item) => total + item.price * item.quantity, 0);

export const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
