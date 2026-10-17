import React from "react";
import { Badge } from "react-bootstrap";

function WarehouseSidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="warehouse-sidebar">
            {/* Top Brand Logo */}
            <div className="sidebar-brand">
                <div className="d-flex align-items-center gap-3">
                    <div className="sidebar-logo-icon">
                        <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                        <div className="text-white fw-bold fs-6 lh-1">BaBy Admin</div>
                        <small className="text-uppercase fw-bold" style={{ fontSize: "10px", color: "#93acc6", letterSpacing: "0.08em" }}>
                            MANAGEMENT CENTER
                        </small>
                    </div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="py-2 flex-grow-1 overflow-y-auto">
                {/* Section 1: Quản trị & Nhập hàng */}
                <div className="sidebar-section-title">QUẢN LÝ NHẬP HÀNG</div>

                <div
                    className={`sidebar-nav-item ${activeTab === "uc06" ? "active" : ""}`}
                    onClick={() => setActiveTab("uc06")}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-file-earmark-text nav-icon fs-6"></i>
                        <span>Quản lý phiếu nhập</span>
                    </div>
                    {activeTab === "uc06" && <i className="bi bi-chevron-right small text-warning"></i>}
                </div>

                <div
                    className={`sidebar-nav-item ${activeTab === "uc08" ? "active" : ""}`}
                    onClick={() => setActiveTab("uc08")}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-check2-circle nav-icon fs-6"></i>
                        <span>Xác nhận nhập kho</span>
                    </div>
                    {activeTab === "uc08" && <i className="bi bi-chevron-right small text-warning"></i>}
                </div>

                {/* Section 2: Vận hành đóng gói */}
                <div className="sidebar-section-title mt-2">VẬN HÀNH ĐÓNG GÓI</div>

                <div
                    className={`sidebar-nav-item ${activeTab === "uc09-list" ? "active" : ""}`}
                    onClick={() => setActiveTab("uc09-list")}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-box-seam nav-icon fs-6"></i>
                        <span>Đơn chờ đóng gói</span>
                    </div>
                    {activeTab === "uc09-list" && <i className="bi bi-chevron-right small text-warning"></i>}
                </div>

                <div
                    className={`sidebar-nav-item ${activeTab === "uc09-detail" ? "active" : ""}`}
                    onClick={() => setActiveTab("uc09-detail")}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-upc-scan nav-icon fs-6"></i>
                        <span>Bàn đóng gói chi tiết</span>
                    </div>
                    {activeTab === "uc09-detail" && <i className="bi bi-chevron-right small text-warning"></i>}
                </div>

                {/* Section 3: Liên kết hệ thống */}
                <div className="sidebar-section-title mt-2">LIÊN KẾT VẬN HÀNH</div>

                <div className="sidebar-nav-item" style={{ cursor: "not-allowed", opacity: 0.65 }}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-tags nav-icon fs-6"></i>
                        <span>Sản phẩm</span>
                    </div>
                    <Badge className="fw-normal" style={{ fontSize: "10px", backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#cbd5e1" }}>
                        Sắp có
                    </Badge>
                </div>

                <div className="sidebar-nav-item" style={{ cursor: "not-allowed", opacity: 0.65 }}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-boxes nav-icon fs-6"></i>
                        <span>Kho hàng & Tồn</span>
                    </div>
                    <Badge className="fw-normal" style={{ fontSize: "10px", backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#cbd5e1" }}>
                        Sắp có
                    </Badge>
                </div>

                <div className="sidebar-nav-item" style={{ cursor: "not-allowed", opacity: 0.65 }}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-receipt nav-icon fs-6"></i>
                        <span>Đơn hàng</span>
                    </div>
                    <Badge className="fw-normal" style={{ fontSize: "10px", backgroundColor: "rgba(255, 255, 255, 0.12)", color: "#cbd5e1" }}>
                        Sắp có
                    </Badge>
                </div>
            </div>

            {/* Bottom Footer Action */}
            <div className="sidebar-footer">
                <div className="sidebar-nav-item mx-0 mb-1" onClick={() => alert("Chuyển tới giao diện Cửa hàng (Customer View)")}>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-shop nav-icon fs-6"></i>
                        <span>Xem cửa hàng</span>
                    </div>
                </div>
                <div className="sidebar-nav-item mx-0" onClick={() => alert("Đăng xuất khỏi hệ thống!")}>
                    <div className="d-flex align-items-center gap-2 text-danger-emphasis">
                        <i className="bi bi-box-arrow-right nav-icon fs-6"></i>
                        <span>Đăng xuất</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default WarehouseSidebar;
