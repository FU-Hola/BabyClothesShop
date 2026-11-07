import { createElement } from "react";
import { createBrowserRouter } from "react-router-dom";
import publicRoutes from "./public.routes.jsx";
import adminRoutes from "./admin.routes.jsx";
import storeStaffRoutes from "./store-staff.routes.jsx";
import warehouseStaffRoutes from "./warehouse-staff.routes.jsx";
import ExceptionPage from "../pages/ExceptionPage/ExceptionPage.jsx";

const routes = createBrowserRouter([
    ...publicRoutes,
    ...adminRoutes,
    ...storeStaffRoutes,
    ...warehouseStaffRoutes,
    { path: "/403", element: createElement(ExceptionPage, { statusCode: 403 }) },
    { path: "/404", element: createElement(ExceptionPage, { statusCode: 404 }) },
    { path: "*", element: createElement(ExceptionPage, { statusCode: 404 }) }
]);

export default routes;
