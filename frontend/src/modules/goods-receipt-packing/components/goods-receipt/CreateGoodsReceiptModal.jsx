import React, { useState } from 'react';
import { Modal, Button, Form, Table, Row, Col, Alert, Badge } from 'react-bootstrap';

function CreateGoodsReceiptModal({
    show,
    onHide,
    onSubmit,
    categories = [],
    products = [],
    sizes = []
}) {
    const [generalInfo, setGeneralInfo] = useState({
        expectedDate: new Date().toISOString().split('T')[0],
        supplier: '',
        note: ''
    });

    const [receiptItems, setReceiptItems] = useState([
        {
            categoryId: '',
            productId: '',
            size: '',
            expectedQuantity: 10
        }
    ]);

    const [errMsg, setErrMsg] = useState("");

    const handleAddRow = () => {
        setErrMsg("");
        setReceiptItems([
            ...receiptItems,
            {
                categoryId: '',
                productId: '',
                size: '',
                expectedQuantity: 10
            }
        ]);
    };

    const handleDeleteRow = (index) => {
        setErrMsg("");
        if (receiptItems.length === 1) {
            setErrMsg("Tối thiểu phải có 1 dòng sản phẩm trong phiếu!");
            return;
        }
        const update = receiptItems.filter((_, i) => i !== index);
        setReceiptItems(update);
    };

    const handleItemChange = (index, field, value) => {
        setErrMsg("");
        const updated = [...receiptItems];
        updated[index][field] = value;

        if (field === "categoryId") {
            updated[index]['productId'] = '';
            updated[index]['size'] = '';
        }

        if (field === "productId") {
            updated[index]['size'] = '';
        }

        setReceiptItems(updated);
    };

    const totalQuantity = receiptItems.reduce((sum, item) =>
        sum + (Number(item.expectedQuantity) || 0), 0
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrMsg("");

        if (!generalInfo.supplier.trim()) {
            setErrMsg("Vui lòng nhập tên nhà cung cấp!");
            return;
        }

        const invalidItem = receiptItems.some(
            i => !i.productId || !i.categoryId || !i.size || Number(i.expectedQuantity) <= 0
        );

        if (invalidItem) {
            setErrMsg("Vui lòng chọn đầy đủ Danh mục, Sản phẩm, Size và Số lượng hợp lệ (> 0) cho tất cả các dòng!");
            return;
        }

        const payload = {
            supplier: generalInfo.supplier,
            expectedDate: generalInfo.expectedDate,
            note: generalInfo.note,
            items: receiptItems.map(item => ({
                productId: Number(item.productId),
                size: item.size,
                expectedQuantity: Number(item.expectedQuantity)
            }))
        };

        onSubmit(payload);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered contentClassName="border-0 shadow-lg rounded-4 overflow-hidden">
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton className="bg-light border-bottom px-4 py-3">
                    <div>
                        <Modal.Title className="fs-5 fw-bold text-dark">Lập Phiếu Nhập Hàng Mới (UC06)</Modal.Title>
                        <small className="text-muted">Tạo đề xuất nhập hàng · Trạng thái lưu: PENDING (Chưa tăng tồn kho)</small>
                    </div>
                </Modal.Header>

                <Modal.Body className="p-4">
                    {errMsg && (
                        <Alert variant="danger" className="py-2 px-3 small rounded-3 d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill"></i>
                            <span>{errMsg}</span>
                        </Alert>
                    )}

                    <div className="admin-card p-3 mb-3 bg-light-subtle">
                        <Row className="g-3">
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-dark mb-1">
                                        Ngày dự kiến nhập:
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        className="admin-select"
                                        value={generalInfo.expectedDate}
                                        onChange={(e) => setGeneralInfo({ ...generalInfo, expectedDate: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-dark mb-1">
                                        Nhà cung cấp (*):
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="VD: Xưởng Dệt Hà Nam..."
                                        className="admin-select"
                                        value={generalInfo.supplier}
                                        onChange={(e) => setGeneralInfo({ ...generalInfo, supplier: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="small fw-semibold text-dark mb-1">
                                        Ghi chú / Đợt hàng:
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập ghi chú thêm..."
                                        className="admin-select"
                                        value={generalInfo.note}
                                        onChange={(e) => setGeneralInfo({ ...generalInfo, note: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold text-dark fs-7">
                            Chi tiết danh mục & sản phẩm dự kiến nhập:
                        </div>
                        <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-2 fw-medium"
                            onClick={handleAddRow}
                        >
                            <i className="bi bi-plus-circle me-1"></i> Thêm dòng sản phẩm
                        </Button>
                    </div>

                    <div className="table-responsive rounded-3 border">
                        <Table hover className="admin-table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th style={{ width: '45px' }} className="text-center">STT</th>
                                    <th style={{ minWidth: '160px' }}>Danh mục</th>
                                    <th style={{ minWidth: '180px' }}>Sản phẩm</th>
                                    <th style={{ width: '120px' }}>Size</th>
                                    <th style={{ width: '120px' }}>SL dự kiến</th>
                                    <th style={{ width: '50px' }} className="text-center">Xóa</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receiptItems.map((row, index) => {
                                    const filteredProducts = row.categoryId
                                        ? products.filter(p => String(p.categoryId) === String(row.categoryId))
                                        : products;

                                    return (
                                        <tr key={index}>
                                            <td className="text-center text-muted fw-bold">{index + 1}</td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    className="admin-select"
                                                    value={row.categoryId}
                                                    onChange={(e) => handleItemChange(index, "categoryId", e.target.value)}
                                                >
                                                    <option value="">-- Chọn danh mục --</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>{c.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    className="admin-select"
                                                    value={row.productId}
                                                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                                                    disabled={!row.categoryId}
                                                >
                                                    <option value="">-- Chọn sản phẩm --</option>
                                                    {filteredProducts.map((p) => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    className="admin-select"
                                                    value={row.size}
                                                    onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                                                    disabled={!row.productId}
                                                >
                                                    <option value="">-- Size --</option>
                                                    {sizes.map((s) => (
                                                        <option key={s.id} value={s.id}>{s.name}</option>
                                                    ))}
                                                </Form.Select>
                                            </td>
                                            <td>
                                                <Form.Control
                                                    size="sm"
                                                    type="number"
                                                    min="1"
                                                    className="admin-select text-end fw-bold"
                                                    value={row.expectedQuantity}
                                                    onChange={(e) => handleItemChange(index, "expectedQuantity", e.target.value)}
                                                />
                                            </td>
                                            <td className="text-center">
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="action-btn-icon text-danger"
                                                    onClick={() => handleDeleteRow(index)}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="table-light">
                                <tr>
                                    <td colSpan={4} className="text-end fw-bold text-dark">Tổng số lượng dự kiến:</td>
                                    <td className="text-end fw-bold text-primary font-monospace">{totalQuantity} sp</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </Table>
                    </div>

                    <div className="mt-3 p-2 px-3 bg-light rounded-2 text-muted small d-flex align-items-center gap-2">
                        <i className="bi bi-info-circle text-primary"></i>
                        <span>Lưu ý: Phiếu tạo xong sẽ chuyển sang trạng thái <strong>PENDING</strong> để Warehouse Staff kiểm nhận thực tế ở bước tiếp theo.</span>
                    </div>
                </Modal.Body>

                <Modal.Footer className="bg-light px-4 py-3 border-top">
                    <Button variant="light" className="border rounded-2 fw-medium px-3" onClick={onHide}>
                        Hủy bỏ
                    </Button>
                    <Button type="submit" className="btn-primary-navy px-4">
                        <i className="bi bi-check-lg me-1"></i> Lưu phiếu nhập hàng
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default CreateGoodsReceiptModal;