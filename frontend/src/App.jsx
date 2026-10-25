import { RouterProvider } from "react-router-dom";
import { CartProvider } from "./modules/cart-checkout/context/CartContext";
import routes from "./app/router/routes.js";

const App = () => {
    return (
        <CartProvider>
            <RouterProvider router={routes} />
        </CartProvider>
    );
};

export default App;
