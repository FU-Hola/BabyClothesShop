import {Outlet, useNavigate} from "react-router-dom";
import StoreStaffSidebar from "../../shared/components/StoreStaff/StoreStaffSidebar.jsx";
import StoreStaffHeader from "../../shared/components/StoreStaff/StoreStaffHeader.jsx";
import StoreStaffFooter from "../../shared/components/StoreStaff/StoreStaffFooter.jsx";
import useAuth from "../../modules/auth/hooks/useAuth.js";

import WarehouseWorkGuard from "../../shared/components/WarehouseWorkGuard.jsx";

const StoreStaffLayout = () => {
    const navigate = useNavigate();
    const {user, logout} = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', {replace: true});
        }
    };

    return (
        <WarehouseWorkGuard><div className="d-flex min-vh-100 fs-6"
             style={{backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Arial, sans-serif"}}>
            <aside className="position-sticky top-0 vh-100 flex-shrink-0"
                   style={{width: "260px", backgroundColor: "#10152B"}}>
                <StoreStaffSidebar onLogout={() => void handleLogout()}/>
            </aside>
            <div className="flex-grow-1 d-flex flex-column">
                <StoreStaffHeader user={user}/>
                <main className="flex-grow-1 px-4 py-3">
                    <Outlet/>
                </main>
                <StoreStaffFooter/>
            </div>
        </div></WarehouseWorkGuard>
    );
};

export default StoreStaffLayout;
