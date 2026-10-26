import { Navigate } from "react-router-dom";
import WarehouseStaffLayout from "../../../app/layouts/WarehouseStaffLayout.jsx";
import WarehouseRouteError from "../components/WarehouseRouteError.jsx";
import WarehouseLoading from "../components/WarehouseLoading.jsx";
import LegacyPackingRedirect from "../components/LegacyPackingRedirect.jsx";

// Chỉ tải code màn đang mở; không đưa toàn bộ biểu mẫu kho vào bundle cửa hàng.
const warehouseRoutes = [
    {
        path: "/warehouse-staff",
        element: <WarehouseStaffLayout />,
        errorElement: <WarehouseRouteError />,
        HydrateFallback: WarehouseLoading,
        children: [
            { index: true, element: <Navigate to="stock" replace /> },
            {
                path: "stock",
                lazy: async () => ({
                    Component: (await import("../pages/InventoryPage.jsx")).default,
                }),
            },
            {
                path: "goods-receipts",
                lazy: async () => ({
                    Component: (await import("../pages/GoodsReceiptListPage.jsx")).default,
                }),
            },
            {
                path: "goods-receipts/new",
                lazy: async () => ({
                    Component: (await import("../pages/CreateGoodsReceiptPage.jsx")).default,
                }),
            },
            {
                path: "goods-receipts/:receiptId",
                lazy: async () => ({
                    Component: (await import("../pages/GoodsReceiptDetailPage.jsx")).default,
                }),
            },
            {
                path: "pending-receipts",
                lazy: async () => ({
                    Component: (await import("../pages/PendingReceiptPage.jsx")).default,
                }),
            },
            {
                path: "issues",
                lazy: async () => ({
                    Component: (await import("../pages/PackingListPage.jsx")).default,
                }),
            },
            {
                path: "issues/:issueId",
                lazy: async () => ({
                    Component: (await import("../pages/PackingPage.jsx")).default,
                }),
            },
            { path: "packing", element: <Navigate to="/warehouse-staff/issues" replace /> },
            { path: "packing/:orderCode", element: <LegacyPackingRedirect /> },
        ],
    },
];

export default warehouseRoutes;
