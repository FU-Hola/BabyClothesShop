import React, { useEffect, useState } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";

function GoodsReceiptFilter({ categories = [], formStatus = [], onFilter, onReset }) {
    const [searchParams, setSearchParams] = useState({
        code: "",
        cateogryId: "",
        goodsStatus: "",
    });

    useEffect(() => {
        if (typeof onFilter === "function") {
            onFilter(searchParams);
        }
    }, [searchParams, onFilter]);

    const handleReset = () => {
        const cleared = { code: "", cateogryId: "", goodsStatus: "" };
        setSearchParams(cleared);
        if (typeof onReset === "function") {
            onReset();
        }
    };

    return (
        <div className="admin-card p-3 mb-4">
            <Row className="g-3 align-items-center">
                {/* Search input with icon */}
                <Col md={5} lg={5}>
                    <div className="search-input-group">
                        <i className="bi bi-search search-icon"></i>
                        <Form.Control
                            type="text"
                            placeholder="Tìm theo mã phiếu nhập hoặc nhà cung cấp..."
                            value={searchParams.code}
                            onChange={(e) => setSearchParams(prev => ({
                                ...prev,
                                code: e.target.value
                            }))}
                        />
                    </div>
                </Col>

                {/* Category dropdown */}
                <Col sm={6} md={3} lg={3}>
                    <Form.Select
                        value={searchParams.cateogryId}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            cateogryId: e.target.value
                        }))}
                        className="admin-select"
                    >
                        <option value="">Tất cả danh mục (4 loại)</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Form.Select>
                </Col>

                {/* Status dropdown */}
                <Col sm={6} md={3} lg={3}>
                    <Form.Select
                        value={searchParams.goodsStatus}
                        onChange={(e) => setSearchParams(prev => ({
                            ...prev,
                            goodsStatus: e.target.value
                        }))}
                        className="admin-select"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {formStatus.map((s) => (
                            <option key={s} value={s}>
                                {s === "PENDING" ? "Chờ xác nhận" : s === "COMPLETED" ? "Đã nhập kho" : s}
                            </option>
                        ))}
                    </Form.Select>
                </Col>

                {/* Reset button with reload icon */}
                <Col md={1} lg={1} className="d-flex justify-content-end">
                    <Button
                        variant="light"
                        className="action-btn-icon border w-100"
                        title="Đặt lại bộ lọc"
                        onClick={handleReset}
                        style={{ height: "38px" }}
                    >
                        <i className="bi bi-arrow-clockwise fs-6"></i>
                    </Button>
                </Col>
            </Row>
        </div>
    );
}

export default GoodsReceiptFilter;