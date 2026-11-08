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
import RoleRoute from './RoleRoute.jsx';
import ExceptionPage from "../pages/ExceptionPage/ExceptionPage.jsx";

const publicRoutes = [
    {
        element: <PublicLayout />,
        errorElement: <ExceptionPage statusCode={404} />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/register", element: <RegisterPage /> },
            { path: "/login", element: <LoginPage /> },
            ...categories.map((category) => ({
                path: category.path,
                element: <ProductList slug={category.slug} />
            })),
            { path: "/search", element: <ProductList /> },
            { path: "/danh-muc/:categorySlug", element: <ProductList /> },
            { path: "/san-pham/:productId", element: <ProductDetail /> },
            {
                element: <RoleRoute allowedRoles={['CUSTOMER']} />,
                children: [
                    { path: '/don-hang', element: <OrderHistory /> },
                    { path: '/don-hang/:orderId', element: <OrderDetail /> },
                    ...cartCheckoutRoutes,
                ],
            },
        ]
    }
];

export default publicRoutes;
