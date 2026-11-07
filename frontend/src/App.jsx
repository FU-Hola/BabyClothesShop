import { RouterProvider } from "react-router-dom";
import { CartProvider } from './modules/cart-checkout/context/CartProvider.jsx';
import AuthProvider from "./modules/auth/context/AuthProvider";
import routes from "./app/router/routes.js";

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <RouterProvider router={routes} />
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
