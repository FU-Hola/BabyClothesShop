import React, { useEffect, useState } from "react";
import { Table, Spinner, Row, Col, Button, Form, Alert } from "react-bootstrap";

function PendingReceiptTable({ data, isLoading, isSubmit, onConfirm }) {
    const [dataTable, setDataTable] = useState(data || null);
    const [discrepancyNote, setDiscrepancyNote] = useState("");

    useEffect(() => {
        if (data) {
            setDataTable(data);
        }
    }, [data]);

    const changeData = (index, newReceiptQuantity) => {
        if (!dataTable || !dataTable.goods) return;
        const updatedGoods = [...dataTable.goods];
        updatedGoods[index] = {
            ...updatedGoods[index],
            receiptQuantity: Math.max(0, Number(newReceiptQuantity) || 0)
        };
        setDataTable({
            ...dataTable,
            goods: updatedGoods
        });
    };

    const handleSubmit = () => {
        if (onConfirm && dataTable) {
            onConfirm({
                ...dataTable,
                discrepancyNote
            });
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card p-5 text-center my-4">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-3 text-muted">Đang tải dữ liệu kiểm nhận phiếu...</p>
            </div>
        );
    }

    if (!data || !data.goods || data.goods.length === 0) {
        return (
            <div className="admin-card text-center my-4 p-5">
                <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-2 d-block"></i>
                <p className="text-muted mb-0">Không tìm thấy dữ liệu phiếu nhập cần kiểm hàng.</p>
            </div>
        );
    }

    const currentGoods = dataTable?.goods || data.goods;
    const totalExpectedQuantity = currentGoods.reduce((sum, item) => sum + (Number(item.expectedQuantity) || 0), 0);
    const totalReceiptQuantity = currentGoods.reduce((sum, item) => sum + (Number(item.receiptQuantity) || 0), 0);
    const diff = totalReceiptQuantity - totalExpectedQuantity;

    return (
        <div className="admin-card p-0 overflow-hidden mb-4">
            {/* Header thông tin phiếu */}
            <div className="p-4 border-bottom bg-white">
                <Row className="g-3 align-items-center">
                    <Col md={3}>
                        <div className="text-muted small fw-medium">MÃ PHIẾU KIỂM</div>
                        <div className="font-monospace fw-bold fs-5 text-dark mt-1">{data.code}</div>
                    </Col>
                    <Col md={3}>
                        <div className="text-muted small fw-medium">DANH MỤC CHÍNH</div>
                        <div className="fw-semibold text-dark mt-1">{data.categoryName}</div>
                    </Col>
                    <Col md={3}>
                        <div className="text-muted small fw-medium">NHÀ CUNG CẤP</div>
                        <div className="fw-semibold text-dark mt-1">{data.supplierName}</div>
                    </Col>
                    <Col md={3}>
                        <div className="text-muted small fw-medium">TRẠNG THÁI PHIẾU</div>
                        <div className="mt-1">
                            <span className="status-badge-dot status-badge-warning">Chờ xác nhận</span>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Bảng chi tiết đối chiếu */}
            <div className="table-responsive">
                <Table className="admin-table align-middle">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }} className="text-center">STT</th>
                            <th style={{ width: '160px' }}>MÃ SKU</th>
                            <th>TÊN SẢN PHẨM</th>
                            <th style={{ width: '140px' }}>DANH MỤC</th>
                            <th style={{ width: '100px' }} className="text-center">SIZE</th>
                            <th style={{ width: '130px' }} className="text-end">SL DỰ KIẾN</th>
                            <th style={{ width: '150px' }} className="text-end">SL THỰC NHẬN</th>
                            <th style={{ width: '150px' }} className="text-center">ĐỐI CHIẾU</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentGoods.map((g, index) => {
                            const expected = Number(g.expectedQuantity);
                            const actual = Number(g.receiptQuantity);
                            const isLess = actual < expected;
                            const isMore = actual > expected;

                            return (
                                <tr key={g.id || index}>
                                    <td className="text-center text-muted fw-semibold">{index + 1}</td>
                                    <td>
                                        <span className="badge-soft-primary font-monospace fw-bold">
                                            {g.sku}
                                        </span>
                                    </td>
                                    <td className="fw-medium text-dark">{g.goodsName}</td>
                                    <td>
                                        <span className="badge-soft-secondary small">{g.categoryName}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="badge bg-light text-dark border px-2">{g.size}</span>
                                    </td>
                                    <td className="text-end fw-semibold text-muted font-monospace">{expected} sp</td>
                                    <td className="text-end">
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            value={g.receiptQuantity}
                                            onChange={(e) => changeData(index, e.target.value)}
                                            className="admin-select text-end fw-bold font-monospace d-inline-block"
                                            style={{ width: "110px" }}
                                        />
                                    </td>
                                    <td className="text-center">
                                        {isLess ? (
                                            <span className="status-badge-dot status-badge-warning">
                                                Thiếu -{expected - actual}
                                            </span>
                                        ) : isMore ? (
                                            <span className="status-badge-dot status-badge-info">
                                                Dư +{actual - expected}
                                            </span>
                                        ) : (
                                            <span className="status-badge-dot status-badge-success">
                                                Đạt chuẩn
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="table-light">
                        <tr>
                            <td colSpan={5} className="text-end fw-bold text-dark py-3">TỔNG CỘNG KIỂM ĐẾM:</td>
                            <td className="text-end fw-bold text-muted font-monospace py-3">{totalExpectedQuantity} sp</td>
                            <td className="text-end fw-bold text-primary font-monospace py-3">{totalReceiptQuantity} sp</td>
                            <td className="text-center py-3">
                                {diff === 0 ? (
                                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                        Khớp 100%
                                    </span>
                                ) : (
                                    <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1">
                                        Lệch {diff > 0 ? `+${diff}` : diff} sp
                                    </span>
                                )}
                            </td>
                        </tr>
                    </tfoot>
                </Table>
            </div>

            {/* Ghi chú chênh lệch và hành động xác nhận */}
            <div className="p-4 bg-white border-top">
                <Row className="g-3 align-items-center">
                    <Col md={7}>
                        <Form.Group>
                            <Form.Label className="small fw-semibold text-dark mb-1">
                                Ghi chú kiểm nhận / Lý do chênh lệch (nếu có hàng lỗi, thiếu):
                            </Form.Label>
                            <Form.Control
                                type="text"
                                className="admin-select"
                                placeholder="VD: 02 áo bị rách nhẹ ở viền, đã hoàn trả nhà cung cấp..."
                                value={discrepancyNote}
                                onChange={(e) => setDiscrepancyNote(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={5} className="d-flex flex-column align-items-end justify-content-end">
                        <Button
                            className="btn-primary-navy px-4 py-2 w-100 w-md-auto d-flex align-items-center justify-content-center gap-2"
                            onClick={handleSubmit}
                            disabled={isSubmit}
                        >
                            {isSubmit ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" />
                                    <span>Đang cập nhật tồn kho...</span>
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check2-circle fs-5"></i>
                                    <span>Xác nhận nhập kho & Tăng tồn kho (UC08)</span>
                                </>
                            )}
                        </Button>
                        <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                            * Hệ thống sẽ tự động TĂNG TỒN THỰC TẾ +{totalReceiptQuantity} sản phẩm và khóa phiếu.
                        </small>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default PendingReceiptTable;