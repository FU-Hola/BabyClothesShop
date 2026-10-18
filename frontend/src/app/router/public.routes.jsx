import PublicLayout from "../layouts/PublicLayout.jsx";
import Home from "../pages/Home/Home.jsx";
import ProductList from "../pages/ProductList/ProductList.jsx";
import ProductDetail from "../pages/ProductDetail/ProductDetail.jsx";
import OrderHistory from "../pages/Orders/OrderHistory.jsx";
import OrderDetail from "../pages/Orders/OrderDetail.jsx";
import categories from "../../shared/constants/categories.js";
import RegisterPage from "../../modules/auth/pages/RegisterPage/RegisterPage.jsx";
import LoginPage from "../../modules/auth/pages/LoginPage/LoginPage.jsx";
import cartCheckoutRoutes from "../../modules/cart-checkout/routes/cartCheckoutRoutes.jsx";
import CartDemoProducts from "../../modules/cart-checkout/components/CartDemoProducts.jsx";

const publicRoutes = [
    {
        element: <PublicLayout />,
        errorElement: <div>404</div>,
        children: [
            { path: "/", element: <Home /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/login", element: <LoginPage /> },
            ...categories.map((category) => ({
                path: category.path,
                element: <ProductList slug={category.slug} />
            })),
            { path: "/test", element: <ProductDetail /> },
            { path: "/don-hang", element: <OrderHistory /> },
            { path: "/don-hang/:orderId", element: <OrderDetail /> },
            { path: "/demo/cart-products", element: <CartDemoProducts /> },
            ...cartCheckoutRoutes
        ]
    }
];

export default publicRoutes;
