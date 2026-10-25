import { Navigate } from "react-router-dom";
import WarehouseStaffLayout from "../layouts/WarehouseStaffLayout.jsx";
import StockOverview from "../../modules/catalog-stock/pages/StockOverview.jsx";
import PendingReceiptPage from "../../modules/goods-receipt-packing/pages/PendingReceiptPage.jsx";
import PackingListPage from "../../modules/goods-receipt-packing/pages/PackingListPage.jsx";
import PackingPage from "../../modules/goods-receipt-packing/pages/PackingPage.jsx";
import GoodsReceiptListPage from "../../modules/goods-receipt-packing/pages/GoodsReceiptListPage.jsx";

const warehouseStaffRoutes = [
    {
        path: "/warehouse-staff",
        element: <WarehouseStaffLayout />,
        children: [
            { index: true, element: <Navigate to="stock" replace /> },
            { path: "goods-receipts", element: <GoodsReceiptListPage /> },
            { path: "pending-receipts", element: <PendingReceiptPage /> },
            { path: "packing", element: <PackingListPage /> },
            { path: "packing/:orderCode", element: <PackingPage /> },
            {
                path: "stock",
                element: <StockOverview />
            }
        ]
    }
];

export default warehouseStaffRoutes;
