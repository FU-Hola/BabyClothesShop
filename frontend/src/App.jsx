import { RouterProvider } from "react-router-dom";
import { CartProvider } from "./modules/cart-checkout/context/CartContext";
import router from "./app/routes/router";

const App = () => {
    return (
        <CartProvider>
            <RouterProvider router={router} />
        </CartProvider>
    );
};

export default App;
