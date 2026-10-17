import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import PackingFilter from '../components/packing/PackingFilter.jsx';
import PackingTableDetail from '../components/packing/PackingTableDetail.jsx';

const MOCK_PACKING_ORDERS = {
    "ORD-8821": {
        orderCode: "ORD-8821",
        orderStatus: "CONFIRMED",
        deliveryName: "GHTK Nhanh",
        paymentStatus: "Paid (Mô phỏng)",
        customerName: "Nguyễn Thị Thu Trang - 0912 345 678",
        customerAddress: "Số 25, Ngõ 102 Trường Chinh, Đống Đa, Hà Nội",
        note: "Giao giờ hành chính, bọc kỹ tránh ướt mưa",
        orderProducts: [
            { id: 1, shelfLocation: "KỆ A1-02", categoryName: "Quần áo trẻ sơ sinh", productName: "Bộ Bodysuit Sợi Tre Cộc Tay", size: "0-3M", expectedQuantity: 2 },
            { id: 2, shelfLocation: "KỆ G2-05", categoryName: "Giày dép", productName: "Giày Sneaker Tập Đi Đế Cao Su", size: "Size 16", expectedQuantity: 1 }
        ]
    },
    "ORD-8824": {
        orderCode: "ORD-8824",
        orderStatus: "CONFIRMED",
        deliveryName: "ViettelPost",
        paymentStatus: "Paid (Mô phỏng)",
        customerName: "Trần Văn Nam - 0988 776 655",
        customerAddress: "Tòa S2.01 Vinhomes Smart City, Tây Mỗ, Hà Nội",
        note: "Gọi trước khi giao 15 phút",
        orderProducts: [
            { id: 3, shelfLocation: "KỆ B2-01", categoryName: "Quần áo bé nam", productName: "Áo Polo Cổ Dệt Bé Trai", size: "2Y", expectedQuantity: 2 }
        ]
    },
    "ORD-8830": {
        orderCode: "ORD-8830",
        orderStatus: "CONFIRMED",
        deliveryName: "Shopee Xpress",
        paymentStatus: "Paid (Mô phỏng)",
        customerName: "Phạm Quốc Dũng - 0932 555 666",
        customerAddress: "Số 12 Quang Trung, Hà Đông, Hà Nội",
        note: "Giao vào buổi chiều",
        orderProducts: [
            { id: 4, shelfLocation: "KỆ A2-04", categoryName: "Quần áo trẻ sơ sinh", productName: "Bộ Ngủ Liền Thân Cotton Organic", size: "3-6M", expectedQuantity: 3 },
            { id: 5, shelfLocation: "KỆ C1-03", categoryName: "Quần áo bé nữ", productName: "Váy Đầm Xòe Hoa Nhí", size: "1Y", expectedQuantity: 2 }
        ]
    }
};

function PackingPage({ onBackToList }) {
    const [orderCodes, setOrderCodes] = useState([]);
    const [selectedOrderCode, setSelectedOrderCode] = useState("");
    const [currentOrder, setCurrentOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const codes = Object.keys(MOCK_PACKING_ORDERS);
        setOrderCodes(codes);
        if (codes.length > 0) {
            setSelectedOrderCode(codes[0]);
            setCurrentOrder(MOCK_PACKING_ORDERS[codes[0]]);
        }
    }, []);

    const handleSelectOrder = (code) => {
        setSelectedOrderCode(code);
        setIsLoading(true);
        setTimeout(() => {
            setCurrentOrder(MOCK_PACKING_ORDERS[code] || null);
            setIsLoading(false);
        }, 150);
    };

    const handleConfirmPacking = (selectedProductIds) => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            alert(`✓ [THÀNH CÔNG] Đơn hàng ${selectedOrderCode} đã đóng gói xong!\n- Trạng thái đơn: Chuyển sang PACKED (Sẵn sàng giao cho shipper).\n- Quy tắc tồn kho: Hàng đã được giữ lúc khách đặt, chưa trừ tồn thực tế (chỉ xuất kho khi Sale Staff bàn giao shipper ở UC14).`);

            // Cập nhật trạng thái đơn thành PACKED
            setCurrentOrder(prev => prev ? { ...prev, orderStatus: "PACKED" } : null);
        }, 600);
    };

    return (
        <div>
            {/* Header & Breadcrumb */}
            <div className="page-breadcrumb">Kho hàng / Bàn đóng gói chi tiết</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h2 className="page-title">Bàn đóng gói chi tiết</h2>
                    <div className="page-subtitle">
                        Kiểm tra vị trí kệ kho, nhặt đúng sản phẩm và xác nhận hoàn tất đóng gói đơn hàng (UC09 - Warehouse Staff).
                    </div>
                </div>
            </div>

            {/* 4 Card chỉ số của đơn */}
            <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-blue">
                            <i className="bi bi-upc-scan"></i>
                        </div>
                        <div>
                            <div className="stat-label">Đơn đang xử lý</div>
                            <div className="stat-value font-monospace fs-6">{selectedOrderCode || "N/A"}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-purple">
                            <i className="bi bi-layers"></i>
                        </div>
                        <div>
                            <div className="stat-label">Số mặt hàng</div>
                            <div className="stat-value">{currentOrder?.orderProducts?.length || 0} món</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-amber">
                            <i className="bi bi-clock-history"></i>
                        </div>
                        <div>
                            <div className="stat-label">Trạng thái đóng</div>
                            <div className="stat-value fs-6">
                                {currentOrder?.orderStatus === "PACKED" ? "Đã đóng gói" : "Cần đóng gói"}
                            </div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-green">
                            <i className="bi bi-truck"></i>
                        </div>
                        <div>
                            <div className="stat-label">Đơn vị vận chuyển</div>
                            <div className="stat-value fs-6">{currentOrder?.deliveryName || "GHTK Nhanh"}</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Bộ chọn đơn */}
            <PackingFilter
                orderCode={orderCodes}
                selectedCode={selectedOrderCode}
                onSelectedCode={handleSelectOrder}
                onBackToList={onBackToList}
            />

            {/* Bảng chi tiết nhặt hàng */}
            <PackingTableDetail
                data={currentOrder}
                isLoading={isLoading}
                isSubmit={isSubmitting}
                onConfirm={handleConfirmPacking}
            />
        </div>
    );
}

export default PackingPage;
