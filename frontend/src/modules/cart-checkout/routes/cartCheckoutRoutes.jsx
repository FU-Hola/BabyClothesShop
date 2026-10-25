import CartPage from "../pages/CartPage/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage.jsx";
import PaymentPage from "../pages/PaymentPage/PaymentPage.jsx";
import OrderResultPage from "../pages/OrderResultPage/OrderResultPage.jsx";

const cartCheckoutRoutes = [
    { path: "/cart", element: <CartPage /> },
    { path: "/checkout", element: <CheckoutPage /> },
    { path: "/checkout/payment", element: <PaymentPage /> },
    { path: "/checkout/result", element: <OrderResultPage /> }
];

export default cartCheckoutRoutes;
