import React, { useState } from "react";
import { Button, Form, Row, Col, Table, Spinner } from "react-bootstrap";

function PackingTableDetail({ data, isLoading, isSubmit, onConfirm }) {
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [packType, setPackType] = useState("carton");

    const handleCheckboxChange = (productId) => {
        const idStr = String(productId);
        setSelectedProducts((prevIds) => {
            if (prevIds.includes(idStr)) {
                return prevIds.filter((i) => i !== idStr);
            } else {
                return [...prevIds, idStr];
            }
        });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked && data?.orderProducts) {
            setSelectedProducts(data.orderProducts.map(p => String(p.id)));
        } else {
            setSelectedProducts([]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onConfirm && data) {
            onConfirm(selectedProducts);
        }
    };

    if (isLoading) {
        return (
            <div className="admin-card text-center my-4 p-5">
                <Spinner animation="border" variant="primary" role="status" />
                <p className="mt-3 text-muted">Đang tải thông tin nhặt hàng cho đơn...</p>
            </div>
        );
    }

    if (!data || !data.orderProducts || data.orderProducts.length === 0) {
        return (
            <div className="admin-card text-center my-4 p-5">
                <i className="bi bi-inbox fs-1 text-muted opacity-50 mb-2 d-block"></i>
                <p className="text-muted mb-0">Không có đơn hàng nào cần đóng gói.</p>
            </div>
        );
    }

    const allChecked = data.orderProducts.length > 0 && selectedProducts.length === data.orderProducts.length;
    const isPacked = data.orderStatus === "PACKED";

    return (
        <div className="admin-card p-0 overflow-hidden mb-4">
            {/* Header thông tin đơn */}
            <div className="p-4 bg-white border-bottom">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <span className="badge-soft-primary font-monospace fw-bold fs-6 px-3 py-1">
                            {data.orderCode}
                        </span>
                        {isPacked ? (
                            <span className="status-badge-dot status-badge-success">Đã đóng gói hoàn tất</span>
                        ) : (
                            <span className="status-badge-dot status-badge-warning">Cần đóng gói</span>
                        )}
                    </div>
                    <div className="d-flex align-items-center gap-2 small">
                        <span className="badge-soft-secondary font-monospace">
                            <i className="bi bi-truck me-1"></i> {data.deliveryName}
                        </span>
                        <span className="badge-soft-secondary">
                            <i className="bi bi-cash-coin me-1"></i> {data.paymentStatus}
                        </span>
                    </div>
                </div>

                <Row className="g-3 small">
                    <Col md={4}>
                        <span className="text-muted d-block mb-1">Khách hàng nhận:</span>
                        <strong className="text-dark fs-7">{data.customerName || "-"}</strong>
                    </Col>
                    <Col md={5}>
                        <span className="text-muted d-block mb-1">Địa chỉ giao hàng:</span>
                        <span className="text-dark">{data.customerAddress || "-"}</span>
                    </Col>
                    <Col md={3}>
                        <span className="text-muted d-block mb-1">Ghi chú vận chuyển:</span>
                        <span className="text-muted fst-italic">{data.note || "Giao giờ hành chính"}</span>
                    </Col>
                </Row>
            </div>

            {/* Bảng Picking List (Nhặt hàng theo kệ) */}
            <div className="table-responsive">
                <Table className="admin-table align-middle">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }} className="text-center">
                                <Form.Check
                                    type="checkbox"
                                    checked={allChecked}
                                    onChange={handleSelectAll}
                                    disabled={isPacked}
                                />
                            </th>
                            <th style={{ width: '150px' }}>VỊ TRÍ KỆ KHO</th>
                            <th style={{ width: '160px' }}>DANH MỤC</th>
                            <th>TÊN SẢN PHẨM CẦN LẤY</th>
                            <th style={{ width: '90px' }} className="text-center">SIZE</th>
                            <th style={{ width: '130px' }} className="text-end">SL CẦN LẤY</th>
                            <th style={{ width: '140px' }} className="text-center">TIẾN ĐỘ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.orderProducts.map((p) => {
                            const isPicked = selectedProducts.includes(String(p.id)) || isPacked;
                            return (
                                <tr key={p.id} className={isPicked ? "bg-light-subtle" : ""}>
                                    <td className="text-center">
                                        <Form.Check
                                            type="checkbox"
                                            checked={isPicked}
                                            onChange={() => handleCheckboxChange(p.id)}
                                            disabled={isPacked}
                                        />
                                    </td>
                                    <td>
                                        <span className="badge-soft-primary font-monospace fw-bold">
                                            <i className="bi bi-geo-alt me-1"></i> {p.shelfLocation || "KỆ A1-02"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge-soft-secondary small">{p.categoryName}</span>
                                    </td>
                                    <td className="fw-medium text-dark">{p.productName}</td>
                                    <td className="text-center font-monospace">
                                        <span className="badge bg-light text-dark border px-2">{p.size}</span>
                                    </td>
                                    <td className="text-end font-monospace fw-bold text-dark">
                                        {p.expectedQuantity} cái
                                    </td>
                                    <td className="text-center">
                                        {isPicked ? (
                                            <span className="status-badge-dot status-badge-success">
                                                Đã nhặt đủ
                                            </span>
                                        ) : (
                                            <span className="status-badge-dot status-badge-neutral">
                                                Chưa lấy
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </div>

            {/* Quy cách gói hàng & Nút xác nhận */}
            <div className="p-4 bg-white border-top">
                <Row className="g-3 align-items-center">
                    <Col md={7}>
                        <div className="d-flex flex-column gap-2">
                            <span className="small fw-semibold text-dark">Quy cách bao bì đóng gói:</span>
                            <div className="d-flex gap-3 small">
                                <Form.Check
                                    type="radio"
                                    id="pack-carton"
                                    name="packType"
                                    label="Hộp carton BabyShop (Size Chuẩn)"
                                    checked={packType === "carton"}
                                    onChange={() => setPackType("carton")}
                                    disabled={isPacked}
                                />
                                <Form.Check
                                    type="radio"
                                    id="pack-pe"
                                    name="packType"
                                    label="Túi niêm phong PE chống nước"
                                    checked={packType === "pe"}
                                    onChange={() => setPackType("pe")}
                                    disabled={isPacked}
                                />
                            </div>
                        </div>
                    </Col>

                    <Col md={5} className="d-flex flex-column align-items-end justify-content-end">
                        <div className="d-flex align-items-center gap-3 w-100 justify-content-end">
                            <div className="small text-muted text-end">
                                Đã nhặt: <strong>{isPacked ? data.orderProducts.length : selectedProducts.length}</strong> / <strong>{data.orderProducts.length}</strong> món
                            </div>
                            <Button
                                className="btn-primary-navy px-4 py-2 d-flex align-items-center gap-2 text-nowrap"
                                onClick={handleSubmit}
                                disabled={isSubmit || (!isPacked && selectedProducts.length === 0) || isPacked}
                            >
                                {isSubmit ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" />
                                        <span>Đang lưu...</span>
                                    </>
                                ) : isPacked ? (
                                    <>
                                        <i className="bi bi-check2-all fs-5 text-success"></i>
                                        <span>Đã đóng gói hoàn tất</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-box-seam fs-5"></i>
                                        <span>Xác nhận đóng gói xong (UC09)</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <small className="text-muted mt-2" style={{ fontSize: "11px" }}>
                            * Đơn sẽ chuyển sang trạng thái <strong>PACKED</strong>. Hàng đã giữ lúc đặt, chưa trừ tồn thực tế.
                        </small>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default PackingTableDetail;