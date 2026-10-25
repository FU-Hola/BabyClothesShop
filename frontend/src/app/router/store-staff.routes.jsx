import { Navigate } from "react-router-dom";
import StoreStaffLayout from "../layouts/StoreStaffLayout.jsx";
import ProductManagement from "../../modules/catalog-stock/pages/ProductManagement.jsx";
import ProductForm from "../../modules/catalog-stock/pages/ProductForm.jsx";
import GoodsReceiptListPage from "../../modules/goods-receipt-packing/pages/GoodsReceiptListPage.jsx";
import StaffOrders from "../../modules/order-management/pages/StaffOrders.jsx";

const storeStaffRoutes = [
    {
        path: "/store-staff",
        element: <StoreStaffLayout />,
        children: [
            { index: true, element: <Navigate to="products" replace /> },
            { path: "orders", element: <StaffOrders /> },
            { path: "orders/:orderId", element: <StaffOrders /> },
            {
                path: "products",
                element: <ProductManagement />
            },
            {
                path: "products/new",
                element: <ProductForm />
            },
            {
                path: "products/:productId/edit",
                element: <ProductForm />
            }
        ]
    },
    {
        path: "/warehouse-operations",
        element: <Navigate to="/store-staff/goods-receipts" replace />
    }
];

export default storeStaffRoutes;
