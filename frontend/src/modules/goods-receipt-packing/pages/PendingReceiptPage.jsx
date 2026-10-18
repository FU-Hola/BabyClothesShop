import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/warehouse.css";
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import PendingReceiptFilter from '../components/pending-receipt/PendingReceiptFilter.jsx';
import PendingReceiptTable from '../components/pending-receipt/PendingReceiptTable.jsx';

const MOCK_PENDING_DATA = {
    "GR-2026-001": {
        code: "GR-2026-001",
        categoryName: "Quần áo trẻ sơ sinh",
        supplierName: "Xưởng Dệt Hà Nam",
        status: "PENDING",
        goods: [
            { id: 101, sku: "BS-COT-WHT-NB", goodsName: "Bộ Bodysuit Sợi Tre Cộc Tay", categoryName: "Quần áo trẻ sơ sinh", size: "Newborn", expectedQuantity: 50, receiptQuantity: 50 },
            { id: 102, sku: "BS-COT-WHT-3M", goodsName: "Bộ Bodysuit Sợi Tre Cộc Tay", categoryName: "Quần áo trẻ sơ sinh", size: "0-3M", expectedQuantity: 50, receiptQuantity: 48 },
            { id: 103, sku: "SET-BORN-03-NB", goodsName: "Set 5 Món Đi Sinh Trọn Gói", categoryName: "Quần áo trẻ sơ sinh", size: "Newborn", expectedQuantity: 50, receiptQuantity: 50 }
        ]
    },
    "GR-2026-005": {
        code: "GR-2026-005",
        categoryName: "Giày dép",
        supplierName: "Cơ sở Da Giày Phúc Yên",
        status: "PENDING",
        goods: [
            { id: 201, sku: "SH-WALK-01-16", goodsName: "Giày Sneaker Tập Đi Đế Cao Su", categoryName: "Giày dép", size: "Size 16", expectedQuantity: 40, receiptQuantity: 40 },
            { id: 202, sku: "SAN-GRL-02-18", goodsName: "Sandal Quai Dán Đính Nơ Da", categoryName: "Giày dép", size: "Size 18", expectedQuantity: 30, receiptQuantity: 30 }
        ]
    }
};

function PendingReceiptPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [receiptCodes, setReceiptCodes] = useState(Object.keys(MOCK_PENDING_DATA));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedCode = searchParams.get("receiptCode") ?? receiptCodes[0] ?? "";
    const currentReceipt = receiptCodes.includes(selectedCode) ? MOCK_PENDING_DATA[selectedCode] : null;

    const handleSelectCode = (code) => {
        setSearchParams(code ? { receiptCode: code } : {});
    };

    const handleConfirmReceipt = (dataToSubmit) => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            const totalActual = dataToSubmit.goods.reduce((s, g) => s + (Number(g.receiptQuantity) || 0), 0);
            alert(`✓ [THÀNH CÔNG] Đã xác nhận phiếu ${dataToSubmit.code}!\n- Tổng số lượng thực nhận: ${totalActual} sản phẩm.\n- Tồn kho hệ thống: ĐÃ ĐƯỢC TĂNG TỰ ĐỘNG +${totalActual}.\n- Trạng thái phiếu: Chuyển sang COMPLETED và được khóa.`);

            // Xóa phiếu đã hoàn tất khỏi danh sách pending
            const remaining = receiptCodes.filter(c => c !== dataToSubmit.code);
            setReceiptCodes(remaining);
            setSearchParams(remaining.length ? { receiptCode: remaining[0] } : {}, { replace: true });
        }, 600);
    };

    return (
        <div className="goods-receipt-packing">
            {/* Breadcrumb & Header */}
            <div className="page-breadcrumb">Kho hàng / Xác nhận nhập kho</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h2 className="page-title">Xác nhận nhập kho & Kiểm đếm</h2>
                    <div className="page-subtitle">
                        Đối chiếu số lượng thực tế với phiếu nhập, ghi chú chênh lệch và tăng tồn kho hệ thống (UC08 - Warehouse Staff).
                    </div>
                </div>
            </div>

            {/* 4 Thẻ chỉ số kiểm nhận */}
            <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-blue">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                        <div>
                            <div className="stat-label">Phiếu chờ kiểm</div>
                            <div className="stat-value">{receiptCodes.length}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-green">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <div>
                            <div className="stat-label">Đã khớp số lượng</div>
                            <div className="stat-value">1</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-amber">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <div>
                            <div className="stat-label">Có chênh lệch</div>
                            <div className="stat-value">1</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-purple">
                            <i className="bi bi-box-arrow-in-down"></i>
                        </div>
                        <div>
                            <div className="stat-label">Tổng SL thực nhận</div>
                            <div className="stat-value">218 sp</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Selector phiếu nhập */}
            <PendingReceiptFilter
                receiptCode={receiptCodes}
                selectedCode={selectedCode}
                onSelectedCode={handleSelectCode}
            />

            {selectedCode && !currentReceipt && (
                <div className="alert alert-warning">
                    Không tìm thấy phiếu nhập {selectedCode} trong dữ liệu chờ kiểm.
                    <Link className="ms-2" to="/warehouse-staff/pending-receipts">Quay lại danh sách phiếu chờ</Link>
                </div>
            )}

            {/* Bảng kiểm nhận & cập nhật tồn kho */}
            <PendingReceiptTable
                key={selectedCode}
                data={currentReceipt}
                isSubmit={isSubmitting}
                onConfirm={handleConfirmReceipt}
            />
        </div>
    );
}

export default PendingReceiptPage;