import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "./public.routes.jsx";
import adminRoutes from "./admin.routes.jsx";
import storeStaffRoutes from "./store-staff.routes.jsx";
import warehouseStaffRoutes from "./warehouse-staff.routes.jsx";

const routes = createBrowserRouter([
    ...publicRoutes,
    ...adminRoutes,
    ...storeStaffRoutes,
    ...warehouseStaffRoutes
]);

export default routes;
