import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home/Home";
import ProductList from "../pages/ProductList/ProductList";


const router = createBrowserRouter([
    {
        element: <MainLayout />,
        errorElement: <div>404</div>,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/ao-so-mi",
                element: <ProductList />
            }
        ]
    }
]);

export default router;

