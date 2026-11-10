import CatalogPagination from "../components/CatalogPagination.jsx";
import {Alert, Container, Form, Button, Row, Col, Card} from "react-bootstrap";
import {Boxes, RotateCcw, Search} from "lucide-react";
import {catalogError, getCategories, getStocks, getStockSummary} from "../api/catalog-stock.api.js";
import StockTable from "../components/StockTable.jsx";
import {useState} from "react";
import {keepPreviousData, useQuery} from "@tanstack/react-query";

const PAGE_SIZE = 4;

const StockOverview = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const params = {
        page: currentPage,
        size: PAGE_SIZE,
        keyword: searchTerm.trim() || undefined,
        categoryId: selectedCategory || undefined,
        variantSize: selectedSize.trim() || undefined,
        status: selectedStatus || undefined
    };

    const stocksQuery = useQuery({
        queryKey: ["stocks", params],
        queryFn: () => getStocks(params),
        staleTime: 0,
        placeholderData: keepPreviousData
    });
    const summaryQuery = useQuery({queryKey: ["stock-summary"], queryFn: getStockSummary, staleTime: 0});
    const categoriesQuery = useQuery({queryKey: ["categories"], queryFn: getCategories});

    const stockPage = stocksQuery.data;
    const totalPages = stockPage?.totalPages ?? 0;
    const categories = categoriesQuery.data ?? [];
    const totalQuantity = summaryQuery.data?.totalQuantity;

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
                    Theo dõi số lượng tồn kho theo từng biến thể.
                </p>
            </div>
            <Card className="border-0 rounded-4 shadow-sm mb-4">
                <Card.Body className="d-flex align-items-center gap-3 p-4">
                    <Boxes size={24} className="text-primary" aria-hidden="true"/>
                    <div>
                        <p className="text-muted small mb-1 fw-medium">Tổng tồn vật lý</p>
                        <p className="h3 fw-bold text-dark mb-0">
                            {totalQuantity == null ? "—" : `${totalQuantity} sp`}
                        </p>
                        <p className="small text-muted mb-0">
                            Đang giữ: {summaryQuery.data?.totalReservedQuantity ?? "—"} · Có thể bán: {summaryQuery.data?.totalAvailableQuantity ?? "—"}
                        </p>
                    </div>
                </Card.Body>
            </Card>
            {summaryQuery.isError && <Alert variant="warning">Không tải được tổng tồn kho. {catalogError(summaryQuery.error)}</Alert>}
            {categoriesQuery.isError && <Alert variant="warning">Không tải được danh mục. {catalogError(categoriesQuery.error)}</Alert>}
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
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col xs={2}>
                        <Form.Group controlId="stockSize">
                            <Form.Label visuallyHidden>Kích cỡ</Form.Label>
                            <Form.Control
                                value={selectedSize}
                                onChange={(event) => {
                                    setSelectedSize(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="bg-light" placeholder="Nhập size" />
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
            <div className="bg-white rounded-4 overflow-hidden shadow-sm p-1 mb-3"
                 style={{opacity: stocksQuery.isPlaceholderData ? 0.6 : 1}}>
                {stockPage && <StockTable stockItems={stockPage.items}/>}
                {stocksQuery.isPending && <p className="text-center py-4 mb-0" role="status">Đang tải tồn kho…</p>}
                {stocksQuery.isError && <Alert variant="danger" className="mb-0">{catalogError(stocksQuery.error)}</Alert>}
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap px-2 mb-4">
                <div className="text-muted small">
                    {stockPage && <>Tìm thấy <span className="fw-semibold text-dark">{stockPage.totalItems}</span> dòng tồn kho</>}
                </div>
                <CatalogPagination currentPage={currentPage} totalPages={totalPages}
                                   onPageChange={setCurrentPage} />
            </div>
        </Container>
    );
};

export default StockOverview;
