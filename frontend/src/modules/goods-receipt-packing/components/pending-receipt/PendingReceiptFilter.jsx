import React from "react";
import { Form, Row, Col } from "react-bootstrap";

function PendingReceiptFilter({ receiptCode = [], selectedCode, onSelectedCode }) {
    return (
        <div className="admin-card p-3 mb-4">
            <Row className="align-items-center g-3">
                <Col md={5} lg={4}>
                    <Form.Label className="fw-semibold text-dark small mb-1">
                        Chọn mã phiếu nhập cần kiểm hàng (Pending):
                    </Form.Label>
                    <Form.Select
                        value={selectedCode || ""}
                        onChange={(e) => onSelectedCode && onSelectedCode(e.target.value)}
                        className="admin-select fw-bold font-monospace"
                    >
                        {receiptCode.map((code) => (
                            <option value={code} key={code}>
                                📋 {code} (Chờ kiểm hàng thực tế)
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={7} lg={8} className="d-flex align-items-center">
                    <div className="p-2 px-3 bg-light rounded-3 text-muted small w-100 border">
                        <i className="bi bi-shield-exclamation text-warning me-1"></i>
                        <span>Nghiệp vụ kho: Hãy đối chiếu kỹ số lượng mở thùng thực tế với số lượng dự kiến trên phiếu. Nhập số lượng thực nhận trước khi bấm xác nhận.</span>
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default PendingReceiptFilter;