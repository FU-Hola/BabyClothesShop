import CatalogPagination from "../components/CatalogPagination.jsx";
import {Container, Form, Button, Row, Col, Card} from "react-bootstrap";
import {Package, CircleCheck, CirclePause, Tags, Plus, RotateCcw, Search} from "lucide-react";
import ProductTable from "../components/ProductTable.jsx";
import {catalogError, getCategories, getProducts} from "../api/catalog-stock.api.js";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {keepPreviousData, useQuery} from "@tanstack/react-query";

const PAGE_SIZE = 4;

const ProductManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");

    const params = {
        page: currentPage,
        size: PAGE_SIZE,
        keyword: searchTerm.trim() || undefined,
        categoryId: selectedCategory || undefined,
        status: selectedStatus || undefined,
        sortDirection: sortOrder.toUpperCase()
    };

    const productsQuery = useQuery({
        queryKey: ["store-products", params],
        queryFn: () => getProducts(params),
        staleTime: 0,
        placeholderData: keepPreviousData
    });
    const categoriesQuery = useQuery({queryKey: ["categories"], queryFn: getCategories});
    const activeQuery = useQuery({
        queryKey: ["store-products-count", "ACTIVE"],
        queryFn: () => getProducts({size: 1, status: "ACTIVE"}),
        staleTime: 0
    });
    const inactiveQuery = useQuery({
        queryKey: ["store-products-count", "INACTIVE"],
        queryFn: () => getProducts({size: 1, status: "INACTIVE"}),
        staleTime: 0
    });

    const pageData = productsQuery.data;
    const totalPages = pageData?.totalPages ?? 0;
    const categories = categoriesQuery.data ?? [];
    const activeCount = activeQuery.data?.totalItems;
    const inactiveCount = inactiveQuery.data?.totalItems;
    const metadataError = categoriesQuery.error || activeQuery.error || inactiveQuery.error;

    const statistics = [
        {
            label: "Tổng sản phẩm",
            value: activeCount != null && inactiveCount != null ? activeCount + inactiveCount : "—",
            icon: Package,
            color: "#2563eb",
            background: "#eff6ff"
        },
        {
            label: "Đang kinh doanh",
            value: activeCount ?? "—",
            icon: CircleCheck,
            color: "#16a34a",
            background: "#f0fdf4"
        },
        {
            label: "Ngừng kinh doanh",
            value: inactiveCount ?? "—",
            icon: CirclePause,
            color: "#d97706",
            background: "#fffbeb"
        },
        {
            label: "Danh mục đang hoạt động",
            value: categoriesQuery.data ? categories.length : "—",
            icon: Tags,
            color: "#9333ea",
            background: "#faf5ff"
        }
    ];

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
                    variant="primary"
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-sm"

                    onClick={handleCreate}
                >
                    <Plus size={18} aria-hidden="true"/>
                    <span>Thêm sản phẩm</span>
                </Button>
            </div>
            {metadataError && <p className="text-danger">Không tải được danh mục hoặc thống kê. {catalogError(metadataError)}</p>}
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
                                    <option key={category.id} value={category.id}>
                                        {category.name}
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
            <div className="bg-white rounded-4 overflow-hidden shadow-sm p-1 mb-3"
                 style={{opacity: productsQuery.isPlaceholderData ? 0.6 : 1}}>
                {pageData && <ProductTable products={pageData.items} onEdit={handleEdit}/>}
                {productsQuery.isPending && <p className="text-center py-4 mb-0">Đang tải sản phẩm…</p>}
                {productsQuery.isError && <p className="text-danger p-3 mb-0">{catalogError(productsQuery.error)}</p>}
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap px-2 mb-4">
                <div className="text-muted small">
                    {pageData && <>Tìm thấy <span className="fw-semibold text-dark">{pageData.totalItems}</span> sản phẩm</>}
                </div>
                <CatalogPagination currentPage={currentPage} totalPages={totalPages}
                                   onPageChange={setCurrentPage} />
            </div>
        </Container>
    );
};

export default ProductManagement;
