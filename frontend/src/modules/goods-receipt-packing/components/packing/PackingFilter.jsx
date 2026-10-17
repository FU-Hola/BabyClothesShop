import React from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

function PackingFilter({ orderCode = [], selectedCode, onSelectedCode, onBackToList }) {
    return (
        <div className="admin-card p-3 mb-4">
            <Row className="align-items-center g-3">
                <Col md={5} lg={4}>
                    <Form.Label className="fw-semibold text-dark small mb-1">
                        Chọn đơn hàng cần đóng gói (Confirmed):
                    </Form.Label>
                    <Form.Select
                        value={selectedCode || ""}
                        onChange={(e) => onSelectedCode && onSelectedCode(e.target.value)}
                        className="admin-select fw-bold font-monospace"
                    >
                        {orderCode.map((o) => (
                            <option key={o} value={o}>
                                📦 {o} (Đơn đã duyệt - Cần nhặt hàng)
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={7} lg={8} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="p-2 px-3 bg-light rounded-3 text-muted small flex-grow-1 border">
                        <i className="bi bi-info-circle text-primary me-1"></i>
                        <span>Thủ kho đối chiếu đúng <strong>Kệ kho</strong>, tích chọn các món đã lấy và bấm xác nhận đóng gói.</span>
                    </div>
                    {onBackToList && (
                        <Button
                            variant="light"
                            className="border rounded-2 fw-medium px-3 text-nowrap"
                            onClick={onBackToList}
                        >
                            <i className="bi bi-arrow-left me-1"></i> Về danh sách đơn
                        </Button>
                    )}
                </Col>
            </Row>
        </div>
    );
}

export default PackingFilter;