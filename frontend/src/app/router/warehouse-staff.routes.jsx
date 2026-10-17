import WarehouseStaffLayout from "../layouts/WarehouseStaffLayout.jsx";
import StockOverview from "../../modules/catalog-stock/pages/StockOverview.jsx";

const warehouseStaffRoutes = [
    {
        path: "/warehouse-staff",
        element: <WarehouseStaffLayout />,
        children: [
            {
                path: "stock",
                element: <StockOverview />
            }
        ]
    }
];

export default warehouseStaffRoutes;
