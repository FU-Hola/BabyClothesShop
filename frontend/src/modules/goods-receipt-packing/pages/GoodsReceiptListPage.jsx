import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Row, Col } from "react-bootstrap";
import GoodsReceiptFilter from '../components/goods-receipt/GoodsReceiptFilter.jsx';
import GoodsReceiptTable from '../components/goods-receipt/GoodsReceiptTable.jsx';
import CreateGoodsReceiptModal from '../components/goods-receipt/CreateGoodsReceiptModal.jsx';

// 4 danh mục chuẩn của hệ thống BabyClothesShop
const MOCK_CATEGORIES = [
    { id: "1", name: "Quần áo trẻ sơ sinh" },
    { id: "2", name: "Quần áo bé nam" },
    { id: "3", name: "Quần áo bé nữ" },
    { id: "4", name: "Giày dép" }
];

const MOCK_STATUS = ["PENDING", "COMPLETED"];

const MOCK_PRODUCTS = [
    { id: 1, categoryId: "1", name: "Bộ Bodysuit Sợi Tre Cộc Tay" },
    { id: 2, categoryId: "1", name: "Bộ Ngủ Liền Thân Cotton Organic" },
    { id: 3, categoryId: "2", name: "Áo Polo Cổ Dệt Bé Trai" },
    { id: 4, categoryId: "3", name: "Váy Đầm Xòe Hoa Nhí" },
    { id: 5, categoryId: "4", name: "Giày Sneaker Tập Đi Đế Cao Su" }
];

const MOCK_SIZES = [
    { id: "NB", name: "Newborn" },
    { id: "3M", name: "0-3M" },
    { id: "6M", name: "3-6M" },
    { id: "1Y", name: "1Y" },
    { id: "2Y", name: "2Y" },
    { id: "16", name: "Size 16" }
];

const INITIAL_RECEIPTS = [
    {
        id: 1,
        code: "GR-2026-001",
        cateogryId: "1",
        categoryName: "Quần áo trẻ sơ sinh",
        supplier: "Xưởng Dệt Hà Nam",
        createdAt: "16/10/2026",
        expectedQuantity: 150,
        goodsStatus: "PENDING"
    },
    {
        id: 2,
        code: "GR-2026-002",
        cateogryId: "2",
        categoryName: "Quần áo bé nam",
        supplier: "Công ty May Nam Định",
        createdAt: "15/10/2026",
        expectedQuantity: 120,
        goodsStatus: "COMPLETED"
    },
    {
        id: 3,
        code: "GR-2026-003",
        cateogryId: "3",
        categoryName: "Quần áo bé nữ",
        supplier: "Xưởng May Tân Bình",
        createdAt: "12/10/2026",
        expectedQuantity: 80,
        goodsStatus: "COMPLETED"
    },
    {
        id: 4,
        code: "GR-2026-004",
        cateogryId: "4",
        categoryName: "Giày dép",
        supplier: "Cơ sở Da Giày Phúc Yên",
        createdAt: "10/10/2026",
        expectedQuantity: 200,
        goodsStatus: "COMPLETED"
    }
];

function GoodsReceiptListPage({ onInspectReceipt }) {
    const [originData, setOriginData] = useState([]);
    const [displayData, setDisplayData] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // 1. Tải dữ liệu ban đầu
    useEffect(() => {
        setOriginData(INITIAL_RECEIPTS);
        setDisplayData(INITIAL_RECEIPTS);
    }, []);

    // 2. Callback filter
    const handleFilter = useCallback((f) => {
        if (!f) return;

        let result = [...originData];

        if (f.code && f.code.trim() !== "") {
            const kw = f.code.trim().toLowerCase();
            result = result.filter(item =>
                item.code.toLowerCase().includes(kw) ||
                item.supplier.toLowerCase().includes(kw)
            );
        }

        if (f.cateogryId && f.cateogryId !== "") {
            result = result.filter(item => String(item.cateogryId) === String(f.cateogryId));
        }

        if (f.goodsStatus && f.goodsStatus !== "") {
            result = result.filter(item => String(item.goodsStatus) === String(f.goodsStatus));
        }

        setDisplayData(result);
    }, [originData]);

    // 3. Xử lý lưu phiếu mới từ modal
    const handleCreateReceipt = (payload) => {
        const selectedCat = MOCK_CATEGORIES.find(c => String(c.id) === String(payload.items[0]?.productId ? MOCK_PRODUCTS.find(p => p.id === payload.items[0].productId)?.categoryId : "1"));

        const newReceipt = {
            id: Date.now(),
            code: `GR-2026-00${originData.length + 1}`,
            cateogryId: selectedCat ? selectedCat.id : "1",
            categoryName: selectedCat ? selectedCat.name : "Quần áo trẻ sơ sinh",
            supplier: payload.supplier,
            createdAt: new Date().toLocaleDateString('vi-VN'),
            expectedQuantity: payload.items.reduce((sum, item) => sum + (Number(item.expectedQuantity) || 0), 0),
            goodsStatus: "PENDING"
        };

        const updated = [newReceipt, ...originData];
        setOriginData(updated);
        setDisplayData(updated);
        setShowModal(false);
        alert(`✓ Đã tạo thành công phiếu nhập ${newReceipt.code}! Trạng thái: PENDING (Tồn kho chưa tăng)`);
    };

    // Thống kê nhanh
    const stats = useMemo(() => {
        const total = originData.length;
        const pending = originData.filter(d => d.goodsStatus === "PENDING").length;
        const completed = originData.filter(d => d.goodsStatus === "COMPLETED").length;
        const totalExpected = originData.reduce((sum, d) => sum + (Number(d.expectedQuantity) || 0), 0);
        return { total, pending, completed, totalExpected };
    }, [originData]);

    return (
        <div>
            {/* Top Page Header & Breadcrumb */}
            <div className="page-breadcrumb">Quản trị / Phiếu nhập hàng</div>
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-4">
                <div>
                    <h2 className="page-title">Quản lý phiếu nhập</h2>
                    <div className="page-subtitle">
                        Theo dõi đề xuất nhập hàng từ nhà cung cấp, phân quyền và kiểm soát phiếu nhập (UC06 - Staff).
                    </div>
                </div>
                <Button
                    className="btn-primary-navy d-flex align-items-center gap-2"
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Tạo phiếu nhập mới</span>
                </Button>
            </div>

            {/* Hàng 4 Card chỉ số giống ảnh mẫu */}
            <Row className="g-3 mb-4">
                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-blue">
                            <i className="bi bi-file-earmark-text"></i>
                        </div>
                        <div>
                            <div className="stat-label">Tổng phiếu nhập</div>
                            <div className="stat-value">{stats.total}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-amber">
                            <i className="bi bi-hourglass-split"></i>
                        </div>
                        <div>
                            <div className="stat-label">Chờ xác nhận</div>
                            <div className="stat-value">{stats.pending}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-green">
                            <i className="bi bi-check2-circle"></i>
                        </div>
                        <div>
                            <div className="stat-label">Đã nhập kho</div>
                            <div className="stat-value">{stats.completed}</div>
                        </div>
                    </div>
                </Col>

                <Col sm={6} lg={3}>
                    <div className="stat-card">
                        <div className="stat-icon-box stat-icon-purple">
                            <i className="bi bi-boxes"></i>
                        </div>
                        <div>
                            <div className="stat-label">Tổng SL dự kiến</div>
                            <div className="stat-value">{stats.totalExpected.toLocaleString("vi-VN")}</div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Thanh tìm kiếm & lọc */}
            <GoodsReceiptFilter
                categories={MOCK_CATEGORIES}
                formStatus={MOCK_STATUS}
                onFilter={handleFilter}
                onReset={() => setDisplayData(originData)}
            />

            {/* Bảng dữ liệu phiếu nhập */}
            <GoodsReceiptTable
                items={displayData}
                onConfirmReceipt={(code) => {
                    if (typeof onInspectReceipt === "function") {
                        onInspectReceipt(code);
                    } else {
                        alert(`Chuyển sang màn hình Xác nhận nhập kho (UC08) cho phiếu ${code}`);
                    }
                }}
                onViewDetail={(id) => alert(`Xem thông tin chi tiết phiếu nhập ID: ${id}`)}
            />

            {/* Modal tạo phiếu nhập */}
            <CreateGoodsReceiptModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSubmit={handleCreateReceipt}
                categories={MOCK_CATEGORIES}
                products={MOCK_PRODUCTS}
                sizes={MOCK_SIZES}
            />
        </div>
    );
}

export default GoodsReceiptListPage;