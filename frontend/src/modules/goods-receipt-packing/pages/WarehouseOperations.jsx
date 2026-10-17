import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/warehouse.css";
import { useState } from "react";
import WarehouseSidebar from "../components/WarehouseSidebar.jsx";
import GoodsReceiptListPage from "./GoodsReceiptListPage.jsx";
import PendingReceiptPage from "./PendingReceiptPage.jsx";
import PackingListPage from "./PackingListPage.jsx";
import PackingPage from "./PackingPage.jsx";

const WarehouseOperations = () => {
  const [activeTab, setActiveTab] = useState("uc06");

  const handleGoToPackingStation = () => {
    setActiveTab("uc09-detail");
  };

  const handleGoToReceiptInspection = () => {
    setActiveTab("uc08");
  };

  return (
    <div className="goods-receipt-packing d-flex min-vh-100 bg-light" style={{ overflowX: "hidden" }}>
      {/* 1. Sidebar bên trái theo role Warehouse */}
      <WarehouseSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Khu vực nội dung chính bên phải */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0, backgroundColor: "var(--admin-bg)" }}>
        {/* Topbar mô phỏng giống ảnh mẫu nhóm */}
        <header className="admin-topbar">
          <div>
            <div className="topbar-subtitle">ADMIN DASHBOARD</div>
            <div className="topbar-title">Trung tâm quản trị kho & vận hành</div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-sm-block text-end">
              <div className="fw-bold fs-7 text-dark lh-1">Nguyễn Văn Hùng</div>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                {activeTab === "uc06" ? "Staff · Quản lý nhập" : "Warehouse Staff · Thủ kho"}
              </small>
            </div>
            <div className="user-avatar-circle">
              H
            </div>
          </div>
        </header>

        {/* Nội dung trang tương ứng */}
        <main className="p-3 p-md-4 flex-grow-1">
          {activeTab === "uc06" && (
            <GoodsReceiptListPage onInspectReceipt={handleGoToReceiptInspection} />
          )}
          {activeTab === "uc08" && (
            <PendingReceiptPage />
          )}
          {activeTab === "uc09-list" && (
            <PackingListPage onGoToPackingStation={handleGoToPackingStation} />
          )}
          {activeTab === "uc09-detail" && (
            <PackingPage onBackToList={() => setActiveTab("uc09-list")} />
          )}
        </main>
      </div>
    </div>
  );
};

export default WarehouseOperations;
