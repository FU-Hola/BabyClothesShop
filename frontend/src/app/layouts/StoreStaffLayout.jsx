import {Outlet} from "react-router-dom";
import StoreStaffSidebar from "../../shared/components/StoreStaff/StoreStaffSidebar.jsx";
import StoreStaffHeader from "../../shared/components/StoreStaff/StoreStaffHeader.jsx";
import StoreStaffFooter from "../../shared/components/StoreStaff/StoreStaffFooter.jsx";

const StoreStaffLayout = () => {
    return (
        <div className="d-flex min-vh-100 fs-6"
             style={{backgroundColor: "#f8fafc", color: "#1e293b", fontFamily: "Arial, sans-serif"}}>
            <aside className="position-sticky top-0 vh-100 flex-shrink-0"
                   style={{width: "260px", backgroundColor: "#10152B"}}>
                <StoreStaffSidebar/>
            </aside>
            <div className="flex-grow-1 d-flex flex-column">
                <StoreStaffHeader/>
                <main className="flex-grow-1 px-4 py-3">
                    <Outlet/>
                </main>
                <StoreStaffFooter/>
            </div>
        </div>
    );
};

export default StoreStaffLayout;
