import React from "react";
import { Table, Button } from "react-bootstrap";

function GoodsReceiptTable({ items = [], onConfirmReceipt, onViewDetail }) {
    const renderStatus = (gStatus) => {
        switch (gStatus) {
            case "PENDING":
                return <span className="status-badge-dot status-badge-warning">Chờ xác nhận</span>;
            case "COMPLETED":
                return <span className="status-badge-dot status-badge-success">Đã nhập kho</span>;
            default:
                return <span className="status-badge-dot status-badge-neutral">{gStatus || "Khác"}</span>;
        }
    };

    return (
        <div className="admin-card p-0 overflow-hidden mb-4">
            <div className="table-responsive">
                <Table className="admin-table align-middle">
                    <thead>
                        <tr>
                            <th className="text-center" style={{ width: "60px" }}>STT</th>
                            <th style={{ width: "140px" }}>MÃ PHIẾU</th>
                            <th>DANH MỤC</th>
                            <th>NHÀ CUNG CẤP</th>
                            <th className="text-center" style={{ width: "130px" }}>NGÀY LẬP</th>
                            <th className="text-end" style={{ width: "140px" }}>SL DỰ KIẾN</th>
                            <th className="text-center" style={{ width: "160px" }}>TRẠNG THÁI</th>
                            <th className="text-center" style={{ width: "150px" }}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-5 text-muted">
                                    <div className="mb-2"><i className="bi bi-inbox fs-1 text-secondary opacity-50"></i></div>
                                    <div>Không tìm thấy phiếu nhập nào phù hợp với bộ lọc.</div>
                                </td>
                            </tr>
                        ) : (
                            items.map((e, index) => (
                                <tr key={e.id || index}>
                                    <td className="text-center text-muted fw-semibold">
                                        {String(index + 1).padStart(2, "0")}
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <span className="badge-soft-primary font-monospace fw-bold">
                                                {e.code}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge-soft-secondary">
                                            {e.categoryName}
                                        </span>
                                    </td>
                                    <td className="fw-medium text-dark">{e.supplier}</td>
                                    <td className="text-center text-muted font-monospace">{e.createdAt}</td>
                                    <td className="text-end fw-bold text-dark font-monospace">
                                        {Number(e.expectedQuantity || 0).toLocaleString("vi-VN")} sp
                                    </td>
                                    <td className="text-center">{renderStatus(e.goodsStatus)}</td>
                                    <td className="text-center">
                                        {e.goodsStatus === "PENDING" ? (
                                            <Button
                                                variant="outline-dark"
                                                size="sm"
                                                className="rounded-2 fw-medium px-2 py-1"
                                                style={{ fontSize: "13px" }}
                                                onClick={() => onConfirmReceipt && onConfirmReceipt(e.code || e.id)}
                                            >
                                                <i className="bi bi-clipboard-check me-1"></i> Kiểm nhận
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="light"
                                                size="sm"
                                                className="action-btn-icon"
                                                title="Xem chi tiết phiếu nhập"
                                                onClick={() => onViewDetail && onViewDetail(e.id)}
                                            >
                                                <i className="bi bi-eye"></i>
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export default GoodsReceiptTable;