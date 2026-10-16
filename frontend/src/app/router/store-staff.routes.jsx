import StoreStaffLayout from "../layouts/StoreStaffLayout.jsx";
import ProductManagement from "../../modules/catalog-stock/pages/ProductManagement.jsx";
import ProductForm from "../../modules/catalog-stock/pages/ProductForm.jsx";

const storeStaffRoutes = [
    {
        path: "/store-staff",
        element: <StoreStaffLayout />,
        children: [
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
    }
];

export default storeStaffRoutes;
