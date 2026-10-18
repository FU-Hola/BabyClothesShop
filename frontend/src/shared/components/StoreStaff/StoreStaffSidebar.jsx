import { Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { Package, ClipboardList, ShoppingBag, Store, ShieldCheck, ChevronRight, LogOut } from "lucide-react";

const menuItems = [
    { label: "Sản phẩm", path: "/store-staff/products", icon: Package },
    { label: "Phiếu nhập", path: "/store-staff/goods-receipts", icon: ClipboardList },
    { label: "Đơn hàng", path: "/store-staff/orders", icon: ShoppingBag }
];

const StoreStaffSidebar = () => {
    const handleLogout = () => {
        console.log("Yêu cầu đăng xuất — chưa tích hợp xác thực.");
    };

    return (
        <div className="d-flex flex-column h-100 p-3 text-white">
            <div className="d-flex align-items-center gap-3 border-bottom border-secondary border-opacity-25 pb-3 mb-3">
                <div
                    className="rounded-3 border border-secondary border-opacity-50 p-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                >
                    <ShieldCheck size={22} aria-hidden="true" />
                </div>
                <div>
                    <p className="fw-bold fs-6 mb-0">BaBy Store Staff</p>
                    <p className="text-white-50 mb-0" style={{ fontSize: "0.7rem", letterSpacing: "0.8px" }}>
                        MANAGEMENT CENTER
                    </p>
                </div>
            </div>
            <p className="text-white-50 fw-semibold px-2 mb-2" style={{ fontSize: "0.725rem", letterSpacing: "0.8px" }}>
                QUẢN LÝ CỬA HÀNG
            </p>
            <nav className="d-flex flex-column gap-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className="d-flex align-items-center gap-3 px-3 py-2 rounded-3 text-decoration-none"
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                                border: isActive ? "1px solid #d97706" : "1px solid transparent",
                                color: isActive ? "#ffffff" : "#94a3b8"
                            })}
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={18} className={isActive ? "text-warning" : "text-white-50"} aria-hidden="true" />
                                    <span className="fw-medium" style={{ fontSize: "0.9rem" }}>
                                        {item.label}
                                    </span>
                                    <ChevronRight size={16} className={`ms-auto ${isActive ? "text-warning" : "text-white-50"}`} aria-hidden="true" />
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
            <div className="mt-auto pt-3 border-top border-secondary border-opacity-25 d-flex flex-column gap-1">
                <Link
                    to="/"
                    className="d-flex align-items-center gap-3 px-3 py-2 text-white-50 text-decoration-none rounded-2"
                    style={{ fontSize: "0.9rem" }}
                >
                    <Store size={18} aria-hidden="true" />
                    <span>Xem cửa hàng</span>
                </Link>
                <Button
                    variant="link"
                    onClick={handleLogout}
                    className="d-flex align-items-center gap-3 px-3 py-2 text-white-50 text-decoration-none text-start border-0 shadow-none"
                    style={{ fontSize: "0.9rem" }}
                >
                    <LogOut size={18} aria-hidden="true" />
                    <span>Đăng xuất</span>
                </Button>
            </div>
        </div>
    );
};

export default StoreStaffSidebar;
