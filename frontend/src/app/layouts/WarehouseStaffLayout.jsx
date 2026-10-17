import {Outlet} from "react-router-dom";
import WarehouseStaffSidebar from "../../shared/components/WarehouseStaff/WarehouseStaffSidebar.jsx";
import WarehouseStaffHeader from "../../shared/components/WarehouseStaff/WarehouseStaffHeader.jsx";
import WarehouseStaffFooter from "../../shared/components/WarehouseStaff/WarehouseStaffFooter.jsx";

const WarehouseStaffLayout = () => {
    return (
        <div className="d-flex min-vh-100 fs-6"
             style={{backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Arial, sans-serif"}}>
            <aside className="position-sticky top-0 vh-100 flex-shrink-0"
                   style={{width: "260px", backgroundColor: "#10152B"}}>
                <WarehouseStaffSidebar/>
            </aside>
            <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
                <WarehouseStaffHeader/>
                <main className="flex-grow-1 px-4 py-3">
                    <Outlet/>
                </main>
                <WarehouseStaffFooter/>
            </div>
        </div>
    );
};

export default WarehouseStaffLayout;
