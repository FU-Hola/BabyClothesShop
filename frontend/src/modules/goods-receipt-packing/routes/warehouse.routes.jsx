import { Navigate } from "react-router-dom";
import WarehouseStaffLayout from "../../../app/layouts/WarehouseStaffLayout.jsx";
import WarehouseRouteError from "../../../shared/components/WarehouseRouteError.jsx";
import WarehouseLoading from "../../../shared/components/WarehouseLoading.jsx";
import LegacyPackingRedirect from "./LegacyPackingRedirect.jsx";

import RoleRoute from "../../../app/router/RoleRoute.jsx";
import StockOverview from "../../catalog-stock/pages/StockOverview.jsx";

const warehouseRoutes = [{ element: <RoleRoute allowedRoles={["WAREHOUSE_STAFF"]} />, children: [
    {
        path: "/warehouse-staff",
        element: <WarehouseStaffLayout />,
        errorElement: <WarehouseRouteError />,
        HydrateFallback: WarehouseLoading,
        children: [
            { index: true, element: <Navigate to="stock" replace /> },
            { path: "stock", element: <StockOverview /> },
            { path: "inventory", element: <Navigate to="/warehouse-staff/stock" replace /> },
            {
                path: "goods-receipts",
                lazy: async () => ({
                    Component: (await import("../features/receipts/pages/GoodsReceiptListPage.jsx")).default,
                }),
            },
            {
                path: "goods-receipts/new",
                lazy: async () => ({
                    Component: (await import("../features/receipts/pages/CreateGoodsReceiptPage.jsx")).default,
                }),
            },
            {
                path: "goods-receipts/:receiptId",
                lazy: async () => ({
                    Component: (await import("../features/receipts/pages/GoodsReceiptDetailPage.jsx")).default,
                }),
            },
            {
                path: "pending-receipts",
                lazy: async () => ({
                    Component: (await import("../features/receipts/pages/PendingReceiptPage.jsx")).default,
                }),
            },
            {
                path: "issues",
                lazy: async () => ({
                    Component: (await import("../features/issues/pages/GoodsIssueListPage.jsx")).default,
                }),
            },
            {
                path: "issues/:issueId",
                lazy: async () => ({
                    Component: (await import("../features/issues/pages/GoodsIssueDetailPage.jsx")).default,
                }),
            },
            { path: "packing", element: <Navigate to="/warehouse-staff/issues" replace /> },
            { path: "packing/:orderCode", element: <LegacyPackingRedirect /> },
        ],
    },
]}];

export default warehouseRoutes;
