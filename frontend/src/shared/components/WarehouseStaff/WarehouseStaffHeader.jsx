const WarehouseStaffHeader = ({ user }) => {
    return (
        <header className="bg-white border-bottom border-light-subtle px-4 py-3 d-flex align-items-center justify-content-between">
            <div>
                <div
                    className="fw-semibold"
                    style={{ fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.5px" }}
                >
                    WAREHOUSE STAFF DASHBOARD
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: "1.05rem" }}>
                    Quản lý kho & vận hành
                </div>
            </div>
            <div className="text-end">
                <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                    {user?.fullName || 'Nhân viên kho'}
                </div>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Warehouse Staff
                </div>
            </div>
        </header>
    );
};

export default WarehouseStaffHeader;
