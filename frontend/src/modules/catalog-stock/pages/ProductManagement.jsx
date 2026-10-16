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
                    <Col xs={5}>
                        <Form.Group controlId="productSearch" className="position-relative">
                            <Form.Label visuallyHidden>Tìm kiếm sản phẩm</Form.Label>
                            <Search
                                size={18}
                                className="position-absolute top-50 translate-middle-y ms-3 text-muted"
                                aria-hidden="true"
                            />
                            <Form.Control
                                type="search"
                                placeholder="Tìm theo tên, mã SKU, mô tả..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                className="bg-light ps-5"
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={3}>
                        <Form.Group controlId="productCategory">
                            <Form.Label visuallyHidden>Danh mục sản phẩm</Form.Label>
                            <Form.Select
                                value={selectedCategory}
                                onChange={(event) => setSelectedCategory(event.target.value)}
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
                    <Col xs={3}>
                        <Form.Group controlId="productStatusFilter">
                            <Form.Label visuallyHidden>Trạng thái kinh doanh</Form.Label>
                            <Form.Select
                                value={selectedStatus}
                                onChange={(event) => setSelectedStatus(event.target.value)}
                                className="bg-light"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang kinh doanh</option>
                                <option value="INACTIVE">Ngừng kinh doanh</option>
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
                <ProductTable products={filteredProducts} onEdit={handleEdit}/>
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 px-2 mb-4">
                <div className="text-muted small">
                    Tìm thấy <span className="fw-semibold text-dark">{filteredProducts.length}</span> sản phẩm
                </div>
                <Pagination size="sm" className="mb-0">
                    <Pagination.Prev disabled>Trước</Pagination.Prev>
                    <Pagination.Item active>{1}</Pagination.Item>
                    <Pagination.Item>{2}</Pagination.Item>
                    <Pagination.Item>{3}</Pagination.Item>
                    <Pagination.Next disabled>Sau</Pagination.Next>
                </Pagination>
            </div>
        </Container>
    );
};

export default ProductManagement;
