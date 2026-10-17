import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import ProductList from "../pages/ProductList/ProductList";
import categories from "../../shared/constants/categories";
import ProductDetail from "../pages/ProductDetail/ProductDetail";
import OrderHistory from "../pages/Orders/OrderHistory";
import OrderDetail from "../pages/Orders/OrderDetail";
import StaffOrders from "../../modules/order-management/pages/StaffOrders";

const router = createBrowserRouter([
    {
        element: <MainLayout />,
        errorElement: <div>404</div>,
        children: [
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
    }
]);

export default router;
