import {Alert, Container, Form, Button, Row, Col, Card, Pagination} from "react-bootstrap";
import {Boxes, RotateCcw, Search} from "lucide-react";
import {catalogError, getCategories, getStocks, getStockSummary} from "../api/catalog-stock.api.js";
import StockTable from "../components/StockTable.jsx";
import {useEffect, useState} from "react";

const StockOverview = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [categoryError, setCategoryError] = useState("");
    const [totalQuantity, setTotalQuantity] = useState(null);
    const [summaryError, setSummaryError] = useState("");
    const [result, setResult] = useState(null);
    const keyword = searchTerm.trim();
    const requestKey = JSON.stringify([keyword, selectedCategory, selectedSize, selectedStatus, currentPage]);

    useEffect(() => {
        let cancelled = false;
        getCategories()
            .then((data) => { if (!cancelled) setCategories(data); })
            .catch((error) => { if (!cancelled) setCategoryError(catalogError(error)); });
        getStockSummary()
            .then((data) => { if (!cancelled) setTotalQuantity(data.totalQuantity); })
            .catch((error) => { if (!cancelled) setSummaryError(catalogError(error)); });
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const params = {
            keyword: keyword || undefined,
            categoryId: selectedCategory || undefined,
            variantSize: selectedSize.trim() || undefined,
            status: selectedStatus || undefined,
            page: currentPage,
            size: 4
        };
        getStocks(params, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setResult({key: requestKey, data});
            })
            .catch((error) => {
                if (!controller.signal.aborted) setResult({key: requestKey, error: catalogError(error)});
            });
        return () => controller.abort();
    }, [keyword, selectedCategory, selectedSize, selectedStatus, currentPage, requestKey]);

    const currentResult = result?.key === requestKey ? result : null;
    const stockPage = currentResult?.data;
    const totalPages = stockPage?.totalPages ?? 0;

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
                        <p className="text-muted small mb-1 fw-medium">Tổng tồn kho</p>
                        <p className="h3 fw-bold text-dark mb-0">
                            {totalQuantity === null ? "—" : `${totalQuantity} sp`}
                        </p>
                    </div>
                </Card.Body>
            </Card>
            {summaryError && <Alert variant="warning">Không tải được tổng tồn kho. {summaryError}</Alert>}
            {categoryError && <Alert variant="warning">Không tải được danh mục. {categoryError}</Alert>}
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
            <div className="bg-white rounded-4 overflow-hidden shadow-sm p-1 mb-3">
                {stockPage && <StockTable stockItems={stockPage.items}/>}
                {!currentResult && <p className="text-center py-4 mb-0" role="status">Đang tải tồn kho…</p>}
                {currentResult?.error && <Alert variant="danger" className="mb-0">{currentResult.error}</Alert>}
            </div>
            <div className="d-flex justify-content-between align-items-center gap-3 px-2 mb-4">
                <div className="text-muted small">
                    {stockPage && <>Tìm thấy <span className="fw-semibold text-dark">{stockPage.totalItems}</span> dòng tồn kho</>}
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
