import React, { useState, useMemo } from "react";
import { Table, Button, Form, Row, Col } from "react-bootstrap";

const MOCK_PACKING_LIST = [
    {
        id: 1,
        orderCode: "ORD-8821",
        customerName: "Nguyễn Thị Thu Trang",
        phone: "0912 345 678",
        initials: "TT",
        address: "Số 25, Ngõ 102 Trường Chinh, Đống Đa, Hà Nội",
        deliveryName: "GHTK Nhanh",
        orderDate: "16/10/2026 10:30",
        totalItems: 3,
        orderStatus: "CONFIRMED"
    },
    {
        id: 2,
        orderCode: "ORD-8824",
        customerName: "Trần Văn Nam",
        phone: "0988 776 655",
        initials: "VN",
        address: "Tòa S2.01 Vinhomes Smart City, Nam Từ Liêm, Hà Nội",
        deliveryName: "ViettelPost",
        orderDate: "16/10/2026 11:15",
        totalItems: 2,
        orderStatus: "CONFIRMED"
    },
    {
        id: 3,
        orderCode: "ORD-8819",
        customerName: "Lê Hoàng Yến",
        phone: "0904 111 222",
        initials: "HY",
        address: "Số 48 Vạn Phúc, Ba Đình, Hà Nội",
        deliveryName: "GHTK Nhanh",
        orderDate: "15/10/2026 09:00",
        totalItems: 4,
        orderStatus: "PACKED"
    },
    {
        id: 4,
        orderCode: "ORD-8815",
        customerName: "Vũ Minh Anh",
        phone: "0977 333 444",
        initials: "MA",
        address: "Khu đô thị Sala, Quận 2, TP. HCM",
        deliveryName: "J&T Express",
        orderDate: "14/10/2026 16:45",
        totalItems: 1,
        orderStatus: "PACKED"
    },
    {
        id: 5,
        orderCode: "ORD-8830",
        customerName: "Phạm Quốc Dũng",
        phone: "0932 555 666",
        initials: "QD",
        address: "Số 12 Quang Trung, Hà Đông, Hà Nội",
        deliveryName: "Shopee Xpress",
        orderDate: "16/10/2026 13:20",
        totalItems: 5,
        orderStatus: "CONFIRMED"
    }
];

function PackingListPage({ onGoToPackingStation }) {
    const [orders, setOrders] = useState(MOCK_PACKING_LIST);
    const [searchCode, setSearchCode] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredOrders = useMemo(() => {
        return orders.filter(item => {
            const matchSearch = !searchCode.trim() || 
                item.orderCode.toLowerCase().includes(searchCode.trim().toLowerCase()) ||
                item.customerName.toLowerCase().includes(searchCode.trim().toLowerCase()) ||
                item.phone.includes(searchCode.trim());

            const matchStatus = statusFilter === "ALL" || item.orderStatus === statusFilter;

            return matchSearch && matchStatus;
        });
    }, [orders, searchCode, statusFilter]);

    const countConfirmed = orders.filter(o => o.orderStatus === "CONFIRMED").length;
    const countPacked = orders.filter(o => o.orderStatus === "PACKED").length;
    const rate = orders.length > 0 ? Math.round((countPacked / orders.length) * 100) : 0;

    return (
        <div>
            {/* Header & Breadcrumb */}
            <div className="page-breadcrumb">Kho hàng / Vận hành đóng gói</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h2 className="page-title">Danh sách đơn hàng đóng gói</h2>
                    <div className="page-subtitle">
                        Theo dõi các đơn hàng cần lấy hàng theo kệ và xác nhận đóng gói (UC09 - Warehouse Staff).
                    </div>
                </div>
                <Button 
                    className="btn-primary-navy d-flex align-items-center gap-2"
                    onClick={() => onGoToPackingStation && onGoToPackingStation("ORD-8821")}
                >
                    <i className="bi bi-box-arrow-in-down"></i>
                    <span>Vào bàn đóng gói ngay</span>
                </Button>
            </div>

            {/* 4 Card chỉ số */}
            <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-blue">
                            <i className="bi bi-receipt"></i>
                        </div>
                        <div>
                            <div className="stat-label">Tổng đơn hàng</div>
                            <div className="stat-value">{orders.length}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-amber">
                            <i className="bi bi-box-seam"></i>
                        </div>
                        <div>
                            <div className="stat-label">Cần đóng gói</div>
                            <div className="stat-value">{countConfirmed}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-green">
                            <i className="bi bi-check-circle"></i>
                        </div>
                        <div>
                            <div className="stat-label">Đã đóng gói</div>
                            <div className="stat-value">{countPacked}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-purple">
                            <i className="bi bi-pie-chart"></i>
                        </div>
                        <div>
                            <div className="stat-label">Tỷ lệ hoàn thành</div>
                            <div className="stat-value">{rate}%</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Bộ lọc đơn hàng */}
            <div className="admin-card p-3 mb-4">
                <Row className="g-3 align-items-center">
                    <Col md={6}>
                        <div className="search-input-group">
                            <i className="bi bi-search search-icon"></i>
                            <Form.Control
                                type="text"
                                placeholder="Tìm theo mã đơn (ORD-...), tên khách hàng hoặc SĐT..."
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value)}
                            />
                        </div>
                    </Col>

                    <Col md={5}>
                        <Form.Select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="admin-select"
                        >
                            <option value="ALL">Tất cả trạng thái ({orders.length} đơn)</option>
                            <option value="CONFIRMED">1. Cần đóng gói (Confirmed - {countConfirmed} đơn)</option>
                            <option value="PACKED">2. Đã đóng gói (Packed - {countPacked} đơn)</option>
                        </Form.Select>
                    </Col>

                    <Col md={1} className="d-flex justify-content-end">
                        <Button 
                            variant="light" 
                            className="action-btn-icon border w-100" 
                            title="Đặt lại bộ lọc"
                            onClick={() => {
                                setSearchCode("");
                                setStatusFilter("ALL");
                            }}
                            style={{ height: "38px" }}
                        >
                            <i className="bi bi-arrow-clockwise fs-6"></i>
                        </Button>
                    </Col>
                </Row>
            </div>

            {/* Bảng danh sách đơn hàng */}
            <div className="admin-card p-0 overflow-hidden mb-4">
                <div className="table-responsive">
                    <Table className="admin-table align-middle">
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }} className="text-center">STT</th>
                                <th style={{ width: '130px' }}>MÃ ĐƠN HÀNG</th>
                                <th>KHÁCH HÀNG</th>
                                <th>ĐỊA CHỈ GIAO HÀNG</th>
                                <th style={{ width: '130px' }}>ĐƠN VỊ VC</th>
                                <th style={{ width: '100px' }} className="text-end">SỐ LƯỢNG</th>
                                <th style={{ width: '160px' }} className="text-center">NGÀY ĐẶT</th>
                                <th style={{ width: '150px' }} className="text-center">TRẠNG THÁI</th>
                                <th style={{ width: '150px' }} className="text-center">THAO TÁC</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-5 text-muted">
                                        <div className="mb-2"><i className="bi bi-inbox fs-1 text-secondary opacity-50"></i></div>
                                        <div>Không tìm thấy đơn hàng nào phù hợp với bộ lọc.</div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="text-center text-muted fw-semibold">
                                            {String(index + 1).padStart(2, "0")}
                                        </td>
                                        <td>
                                            <span className="badge-soft-primary font-monospace fw-bold">
                                                {item.orderCode}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="user-avatar-circle" style={{ width: "32px", height: "32px", fontSize: "12px" }}>
                                                    {item.initials}
                                                </div>
                                                <div>
                                                    <div className="fw-semibold text-dark">{item.customerName}</div>
                                                    <small className="text-muted font-monospace">{item.phone}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-truncate" style={{ maxWidth: '280px' }} title={item.address}>
                                                {item.address}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge-soft-secondary">
                                                {item.deliveryName}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold text-dark font-monospace">
                                            {item.totalItems} món
                                        </td>
                                        <td className="text-center text-muted font-monospace small">
                                            {item.orderDate}
                                        </td>
                                        <td className="text-center">
                                            {item.orderStatus === "CONFIRMED" ? (
                                                <span className="status-badge-dot status-badge-warning">
                                                    Cần đóng gói
                                                </span>
                                            ) : (
                                                <span className="status-badge-dot status-badge-success">
                                                    Đã đóng gói
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {item.orderStatus === "CONFIRMED" ? (
                                                <Button
                                                    variant="dark"
                                                    size="sm"
                                                    className="rounded-2 fw-medium px-2 py-1"
                                                    style={{ fontSize: "13px", backgroundColor: "#0f2942" }}
                                                    onClick={() => onGoToPackingStation && onGoToPackingStation(item.orderCode)}
                                                >
                                                    Đóng gói ngay →
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="light"
                                                    size="sm"
                                                    className="action-btn-icon"
                                                    title="Xem chi tiết đơn đã đóng gói"
                                                    onClick={() => alert(`Đơn ${item.orderCode} đã đóng gói xong, đang chờ nhân viên giao nhận bàn giao (UC14).`)}
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
        </div>
    );
}

export default PackingListPage;
