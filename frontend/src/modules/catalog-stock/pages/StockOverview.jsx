import {Container, Form, Button, Row, Col, Card, Pagination} from "react-bootstrap";
import {Boxes, CircleCheck, Clock, RotateCcw, Search} from "lucide-react";
import mockStock from "../api/mockStock.js";
import StockTable from "../components/StockTable.jsx";
import {useState} from "react";

const stockItems = mockStock.map((item) => ({
    ...item,
    availableStock: item.physicalStock - item.reservedStock
}));

const StockOverview = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 4;

    const categories = Array.from(new Set(mockStock.map((item) => item.category)));

    const totalPhysical = stockItems.reduce((acc, curr) => acc + curr.physicalStock, 0);
    const totalReserved = stockItems.reduce((acc, curr) => acc + curr.reservedStock, 0);
    const totalAvailable = totalPhysical - totalReserved;

    const statistics = [
        {
            label: "Tổng tồn thực tế",
            value: totalPhysical,
            icon: Boxes,
            color: "#2563eb",
            background: "#eff6ff"
        },
        {
            label: "Đang giữ cho đơn",
            value: totalReserved,
            icon: Clock,
            color: "#d97706",
            background: "#fffbeb"
        },
        {
            label: "Có thể bán",
            value: totalAvailable,
            icon: CircleCheck,
            color: "#16a34a",
            background: "#f0fdf4"
        }
    ];

    const keyword = searchTerm.trim().toLowerCase();
    const filteredStock = stockItems.filter((item) => {
        const conditionKeyword =
            item.productName.toLowerCase().includes(keyword) ||
            item.sku.toLowerCase().includes(keyword);
        const conditionCategory =
            selectedCategory === "" || item.category === selectedCategory;
        const conditionSize =
            selectedSize === "" || item.size === selectedSize;
        const stockStatus =
            item.availableStock > 0 ? "IN_STOCK" : "OUT_OF_STOCK";
        const conditionStatus =
            selectedStatus === "" || stockStatus === selectedStatus;
        return conditionKeyword && conditionCategory && conditionSize && conditionStatus;
    });

    const totalPages = Math.ceil(filteredStock.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedStock = filteredStock.slice(startIndex, startIndex + pageSize);

    const handleReset = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedSize("");
        setSelectedStatus("");
        setCurrentPage(1);
    };

    return (
        <Container fluid className="py-2 px-0">
            <p className="text-muted small mb-2">Quản trị / Tồn kho sản phẩm</p>
            <div className="mb-4">
                <h1 className="h3 fw-bold text-dark mb-1">Quản lý tồn kho</h1>
                <p className="text-muted small mb-0">
                    Theo dõi tồn thực tế, đang giữ và có thể bán theo từng size.
                </p>
            </div>
            <Row className="row-cols-3 g-3 mb-4">
                {statistics.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Col key={item.label}>
                            <Card className="border-0 rounded-4 h-100 shadow-sm">
                                <Card.Body className="d-flex align-items-center gap-3 p-4">
                                    <span
                                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            backgroundColor: item.background,
                                            color: item.color
                                        }}
                                    >
                                        <Icon size={24} aria-hidden="true"/>
                                    </span>
                                    <div>
                                        <p className="text-muted small mb-1 fw-medium">{item.label}</p>
                                        <p className="h3 fw-bold text-dark mb-0">
                                            {item.value} <span className="fs-6 fw-normal text-muted">sp</span>
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
            </Row>
            <div className="bg-white rounded-4 p-3 mb-4 shadow-sm">
                <Row className="g-3 align-items-center">
                    <Col xs={4}>
                        <Form.Group controlId="stockSearch" className="position-relative">
                            <Form.Label visuallyHidden>Tìm kiếm theo tên, SKU</Form.Label>
                            <Search
                                size={18}
                                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                                aria-hidden="true"
                            />
                            <Form.Control
                                type="search"
                                placeholder="Tìm theo tên sản phẩm, mã SKU..."
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light ps-5"
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group controlId="stockCategory">
                            <Form.Label visuallyHidden>Danh mục</Form.Label>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(event) => {
                                    setSelectedCategory(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        <Form.Group controlId="stockSize">
                            <Form.Label visuallyHidden>Kích cỡ</Form.Label>
                            <Form.Select
                                value={selectedSize}
                                onChange={(event) => {
                                    setSelectedSize(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light"
                            >
                                <option value="">Tất cả size</option>
                                <option value="S">Size S</option>
                                <option value="M">Size M</option>
                                <option value="L">Size L</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        <Form.Group controlId="stockStatus">
                            <Form.Label visuallyHidden>Trạng thái kho</Form.Label>
                            <Form.Select
                                value={selectedStatus}
                                onChange={(event) => {
                                    setSelectedStatus(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="IN_STOCK">Còn hàng</option>
                                <option value="OUT_OF_STOCK">Hết hàng</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={1} className="d-flex justify-content-end">
                        <Button
                            variant="outline-secondary"
                            onClick={handleReset}
                            title="Đặt lại bộ lọc"
                            className="d-flex align-items-center justify-content-center bg-light"
                            style={{width: "40px", height: "38px"}}
                        >
                            <RotateCcw size={18} aria-hidden="true"/>
                            <span className="visually-hidden">Đặt lại bộ lọc</span>
                        </Button>
                    </Col>
                </Row>
            </div>
            <div className="bg-white rounded-4 overflow-hidden shadow-sm p-1 mb-3">
                <StockTable stockItems={paginatedStock}/>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 px-2 mb-4">
                <div className="text-muted small">
                    Tìm thấy <span className="fw-semibold text-dark">{filteredStock.length}</span> dòng tồn kho
                </div>
                {totalPages > 1 && (
                    <Pagination size="sm" className="mb-0">
                        <Pagination.Prev
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Trước
                        </Pagination.Prev>
                        {Array.from({length: totalPages}, (_, index) => {
                            const pageNumber = index + 1;

                            return (
                                <Pagination.Item
                                    key={pageNumber}
                                    active={currentPage === pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                >
                                    {pageNumber}
                                </Pagination.Item>
                            );
                        })}
                        <Pagination.Next
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Sau
                        </Pagination.Next>
                    </Pagination>
                )}
            </div>
        </Container>
    );
};

export default StockOverview;
