import { Navigate } from "react-router-dom";
import StoreStaffLayout from "../layouts/StoreStaffLayout.jsx";
import ProductManagement from "../../modules/catalog-stock/pages/ProductManagement.jsx";
import ProductForm from "../../modules/catalog-stock/pages/ProductForm.jsx";
import StaffOrders from "../../modules/order-management/pages/StaffOrders.jsx";
import RoleRoute from "./RoleRoute.jsx";

const storeStaffRoutes = [
    {
        element: <RoleRoute allowedRoles={['STORE_STAFF']} />,
        children: [
            {
                path: "/store-staff",
                element: <StoreStaffLayout />,
                children: [
                    { index: true, element: <Navigate to="products" replace /> },
                    { path: "orders", element: <StaffOrders /> },
                    { path: "orders/:orderId", element: <StaffOrders /> },
                    { path: "products", element: <ProductManagement /> },
                    { path: "products/new", element: <ProductForm /> },
                    { path: "products/:productId/edit", element: <ProductForm /> },
                    {
                        path: "goods-receipts",
                        lazy: async () => ({
                            Component: (await import("../../modules/goods-receipt-packing/features/receipts/pages/GoodsReceiptListPage.jsx")).default,
                        }),
                    },
                    {
                        path: "goods-receipts/new",
                        lazy: async () => ({
                            Component: (await import("../../modules/goods-receipt-packing/features/receipts/pages/CreateGoodsReceiptPage.jsx")).default,
                        }),
                    },
                    {
                        path: "goods-receipts/:receiptId",
                        lazy: async () => ({
                            Component: (await import("../../modules/goods-receipt-packing/features/receipts/pages/GoodsReceiptDetailPage.jsx")).default,
                        }),
                    }
                ]
            }
        ]
    },
    {
        path: "/warehouse-operations",
        element: <Navigate to="/store-staff/goods-receipts" replace />
    }
];

export default storeStaffRoutes;
