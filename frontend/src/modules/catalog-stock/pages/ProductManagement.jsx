import {Container, Form, Button, Row, Col, Card, Pagination} from "react-bootstrap";
import {Package, CircleCheck, CirclePause, Tags, Plus, RotateCcw, Search} from "lucide-react";
import ProductTable from "../components/ProductTable.jsx";
import mockProducts from "../api/mockProducts.js";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

const ProductManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const pageSize = 4;

    const categories = Array.from(new Set(mockProducts.map((product) => product.category)));

    const statistics = [
        {
            label: "Tổng sản phẩm",
            value: mockProducts.length,
            icon: Package,
            color: "#2563eb",
            background: "#eff6ff"
        },
        {
            label: "Đang kinh doanh",
            value: mockProducts.filter((product) => product.status === "ACTIVE").length,
            icon: CircleCheck,
            color: "#16a34a",
            background: "#f0fdf4"
        },
        {
            label: "Ngừng kinh doanh",
            value: mockProducts.filter((product) => product.status === "INACTIVE").length,
            icon: CirclePause,
            color: "#d97706",
            background: "#fffbeb"
        },
        {
            label: "Danh mục có sản phẩm",
            value: categories.length,
            icon: Tags,
            color: "#9333ea",
            background: "#faf5ff"
        }
    ];

    const keyword = searchTerm.trim().toLowerCase();
    const filteredProducts = mockProducts.filter((product) => {
        const conditionKeyword =
            product.name.toLowerCase().includes(keyword) ||
            product.sku.toLowerCase().includes(keyword) ||
            product.description.toLowerCase().includes(keyword);
        const conditionCategory = selectedCategory === "" || product.category === selectedCategory;
        const conditionStatus = selectedStatus === "" || product.status === selectedStatus;
        return conditionKeyword && conditionCategory && conditionStatus;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    const totalPages = Math.ceil(filteredProducts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);

    const handleEdit = (productId) => {
        navigate(`/store-staff/products/${productId}/edit`);
    };

    const handleCreate = () => {
        navigate("/store-staff/products/new");
    };

    const handleReset = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setSelectedStatus("");
        setSortOrder("desc");
        setCurrentPage(1);
    };

    return (
        <Container fluid className="py-2 px-0">
            <p className="text-muted small mb-2">Quản trị / Quản lý sản phẩm</p>
            <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h1 className="h3 fw-bold text-dark mb-1">Quản lý sản phẩm</h1>
                    <p className="text-muted small mb-0">
                        Theo dõi danh mục, giá bán và trạng thái kinh doanh của sản phẩm.
                    </p>
                </div>

                <Button
                    variant="dark"
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white border-0 shadow-sm"
                    style={{backgroundColor: "#10152B"}}
                    onClick={handleCreate}
                >
                    <Plus size={18} aria-hidden="true"/>
                    <span>Thêm sản phẩm</span>
                </Button>
            </div>
            <Row className="row-cols-4 g-3 mb-4">
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
                                        <p className="h3 fw-bold text-dark mb-0">{item.value}</p>
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
                        <Form.Group controlId="productSearch" className="position-relative">
                            <Search
                                size={18}
                                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                                aria-hidden="true"
                            />
                            <Form.Control
                                type="search"
                                placeholder="Tìm theo tên, mã SKU, mô tả..."
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light ps-5"
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        <Form.Group controlId="productCategory">
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
                        <Form.Group controlId="productStatusFilter">
                            <Form.Select
                                value={selectedStatus}
                                onChange={(event) => {
                                    setSelectedStatus(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang kinh doanh</option>
                                <option value="INACTIVE">Ngừng kinh doanh</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group controlId="productSortOrder">
                            <Form.Select
                                value={sortOrder}
                                onChange={(event) => {
                                    setSortOrder(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light"
                            >
                                <option value="desc">Ngày tạo: Giảm dần</option>
                                <option value="asc">Ngày tạo: Tăng dần</option>
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
                <ProductTable products={paginatedProducts} onEdit={handleEdit}/>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 px-2 mb-4">
                <div className="text-muted small">
                    Tìm thấy <span className="fw-semibold text-dark">{filteredProducts.length}</span> sản phẩm
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

export default ProductManagement;
