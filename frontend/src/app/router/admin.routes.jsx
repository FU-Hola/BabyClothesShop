import { Navigate } from "react-router-dom";
import AdminRoute from "./AdminRoute.jsx";
import AdminLayout from "../layouts/AdminLayout/AdminLayout.jsx";
import AccountManagementPage from "../../modules/account/pages/AccountManagementPage/AccountManagementPage.jsx";

const adminRoutes = [
    {
        element: <AdminRoute />,
        children: [
            {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                    { index: true, element: <Navigate to="staff" replace /> },
                    { path: "accounts", element: <Navigate to="/admin/staff" replace /> },
                    {
                        path: "staff",
                        element: <AccountManagementPage key="staff" accountType="staff" />
                    },
                    {
                        path: "customers",
                        element: <AccountManagementPage key="customer" accountType="customer" />
                    }
                ]
            }
        ]
    }
];

export default adminRoutes;
