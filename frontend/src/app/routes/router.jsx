import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import ProductList from "../pages/ProductList/ProductList";
import categories from "../../shared/constants/categories";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderDetail from "../pages/Orders/OrderDetail";
import StaffOrders from "../../modules/order-management/pages/StaffOrders.jsx";
import AdminRoute from "./AdminRoute";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import AccountManagementPage from "../../modules/account/pages/AccountManagementPage/AccountManagementPage";
import RegisterPage from "../../modules/auth/pages/RegisterPage/RegisterPage";
import LoginPage from "../../modules/auth/pages/LoginPage/LoginPage";
import storeStaffRoutes from "../router/store-staff.routes.jsx";
import warehouseStaffRoutes from "../router/warehouse-staff.routes.jsx";
import { cartCheckoutRouteList } from "../../modules/cart-checkout/routes";
import WarehouseOperations from "../../modules/goods-receipt-packing/pages/WarehouseOperations.jsx";

const router = createBrowserRouter([
    {
        path: "/warehouse-operations",
        element: <WarehouseOperations />
    },
    {
        element: <MainLayout />,
        errorElement: <div>404</div>,
        children: [
            ...cartCheckoutRouteList,
            {
                path: "/register",
                element: <RegisterPage />
            },
            {
                path: "/login",
                element: <LoginPage />
            },
            {
                path: "/",
                element: <Home />
            },
            ...categories.map((c) => (
                {
                    path: c.path,
                    element: <ProductList slug={c.slug} />
                }
            )),
            {
                path: "/test",
                element: <ProductDetail />
            },
            {
                path: "/don-hang",
                element: <OrderHistory />
            },
            {
                path: "/don-hang/:orderId",
                element: <OrderDetail />
            }
        ]
    },
    {
        path: "/sale-staff/don-hang",
        element: <StaffOrders />
    },
    {
        path: "/sale-staff/don-hang/:orderId",
        element: <StaffOrders />
    },
    {
        element: <AdminRoute />,
        children: [
            {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="staff" replace />
                    },
                    {
                        path: "accounts",
                        element: <Navigate to="/admin/staff" replace />
                    },
                    {
                        path: "staff",
                        element: <AccountManagementPage key="staff" accountType="staff" />
                    },
                    {
                        path: "customers",
                        element: <AccountManagementPage key="customer" accountType="customer" />
                    }
                ]
            }
        ]
    },
    ...storeStaffRoutes,
    ...warehouseStaffRoutes
]);

export default router;
