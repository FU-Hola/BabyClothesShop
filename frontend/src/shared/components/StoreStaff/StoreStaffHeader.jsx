const StoreStaffHeader = () => {
    const staff = {
        name: "Nguyễn Văn A",
        role: "Store Staff"
    };

    return (
        <header className="bg-white border-bottom border-light-subtle px-4 py-3 d-flex align-items-center justify-content-between">
            <div>
                <div
                    className="fw-semibold"
                    style={{ fontSize: "0.75rem", color: "#64748b", letterSpacing: "0.5px" }}
                >
                    STORE STAFF DASHBOARD
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: "1.05rem" }}>
                    Quản lý sản phẩm & vận hành
                </div>
            </div>
            <div className="text-end">
                <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                    {staff.name}
                </div>
                <div className="text-muted" style={{ fontSize: "0.8rem" }}>
                    {staff.role}
                </div>
            </div>
        </header>
    );
};

export default StoreStaffHeader;
