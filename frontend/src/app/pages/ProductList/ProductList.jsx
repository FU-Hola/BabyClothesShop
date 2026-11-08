import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Form, Modal } from "react-bootstrap";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { getCatalogProducts } from "../../../shared/api/catalogApi.js";
import { useCart } from "../../../modules/cart-checkout/hooks/useCart.js";
import categories from "../../../shared/constants/categories.js";
import CatalogPagination from "../../../modules/catalog-stock/components/CatalogPagination.jsx";
import styles from "./ProductList.module.css";

const FALLBACK_IMAGE = "/images/products/sample-baby-romper.png";

const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(price)} đ`;

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [variantId, setVariantId] = useState(
        product.variants.find((item) => Number(item.availableStock) > 0)?.id ?? product.variants[0]?.id ?? "",
    );
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [adding, setAdding] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
    const available = Number(variant?.availableStock ?? 0);
    const colors = [...new Set(product.variants.map((item) => item.color))];
    const sizes = product.variants.filter((item) => item.color === variant?.color);
    const hasStock = product.variants.some((item) => Number(item.availableStock) > 0);

    const openOptions = () => {
        setVariantId(product.variants.find((item) => Number(item.availableStock) > 0)?.id ?? product.variants[0]?.id ?? "");
        setQuantity(1);
        setMessage("");
        setShowOptions(true);
    };

    const changeQuantity = (next) => {
        const limit = Math.max(available, 1);
        setQuantity(Math.min(limit, Math.max(1, next)));
    };

    const handleAdd = async () => {
        if (!variant || available < 1) {
            setMessage("Sản phẩm này đã hết hàng.");
            return;
        }
        setAdding(true);
        try {
            const result = await addToCart({
                id: product.id,
                variantId: variant.id,
                name: product.name,
                price: Number(variant.price),
                image: product.imageUrl || FALLBACK_IMAGE,
                sku: variant.sku,
                maxStock: available,
            }, variant.size, quantity);
            setMessage(result.message);
            if (result.success) setShowOptions(false);
        } catch {
            setMessage("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
        } finally {
            setAdding(false);
        }
    };

    return (
        <article className={styles.card}>
            <Link to={`/san-pham/${product.id}`} className={styles.imageLink}>
                <div className={styles.imageBox}>
                    <img src={product.imageUrl || FALLBACK_IMAGE} alt={product.name} />
                </div>
            </Link>
            <div className={styles.info}>
                <p>{product.name}</p>
                <div className={styles.prices}>
                    <strong>{formatPrice(product.minPrice)}</strong>
                </div>
                <div className={styles.cardActions}>
                    <button type="button" onClick={openOptions} disabled={!hasStock}>
                        {hasStock ? "Thêm vào giỏ" : "Hết hàng"}
                    </button>
                    <Link to={`/san-pham/${product.id}`}>Xem chi tiết</Link>
                </div>
                {!showOptions && message && <p className={styles.notice}>{message}</p>}
            </div>
            <Modal show={showOptions} onHide={() => { if (!adding) setShowOptions(false); }} centered size="lg">
                <Modal.Header closeButton closeLabel="Đóng">
                    <Modal.Title>Chọn sản phẩm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className={styles.optionSummary}>
                        <img src={product.imageUrl || FALLBACK_IMAGE} alt={product.name} />
                        <div>
                            <h5>{product.name}</h5>
                            <div className={styles.prices}>
                                <strong>{formatPrice(variant?.price ?? product.minPrice)}</strong>
                                {variant?.originalPrice > variant?.price && <del>{formatPrice(variant.originalPrice)}</del>}
                            </div>
                            <p>Kho: {available}</p>
                            <p>SKU: {variant?.sku}</p>
                        </div>
                    </div>
                    <p className={styles.optionLabel}>Màu sắc: {variant?.color}</p>
                    <div className={styles.optionButtons}>
                        {colors.map((color) => (
                            <Button key={color} variant={color === variant?.color ? "primary" : "outline-secondary"}
                                    disabled={adding} onClick={() => {
                                        const next = product.variants.find((item) => item.color === color && item.size === variant?.size)
                                            ?? product.variants.find((item) => item.color === color && Number(item.availableStock) > 0)
                                            ?? product.variants.find((item) => item.color === color);
                                        setVariantId(next.id);
                                        setQuantity(1);
                                        setMessage("");
                                    }}>{color}</Button>
                        ))}
                    </div>
                    <p className={styles.optionLabel}>Kích cỡ</p>
                    <div className={styles.optionButtons}>
                        {sizes.map((item) => (
                            <Button key={item.id} variant={item.id === variant?.id ? "primary" : "outline-secondary"}
                                    disabled={adding || Number(item.availableStock) < 1} onClick={() => {
                                        setVariantId(item.id);
                                        setQuantity(1);
                                        setMessage("");
                                    }}>{item.size}</Button>
                        ))}
                    </div>
                    <p className={styles.optionLabel}>Số lượng</p>
                    <div className={styles.quantity}>
                        <button type="button" title="Giảm số lượng" disabled={adding || quantity <= 1}
                                onClick={() => changeQuantity(quantity - 1)}><Minus size={16} /></button>
                        <span>{quantity}</span>
                        <button type="button" title="Tăng số lượng" disabled={adding || quantity >= available}
                                onClick={() => changeQuantity(quantity + 1)}><Plus size={16} /></button>
                    </div>
                    {available < 1 && <p className={styles.notice}>Biến thể này đã hết hàng.</p>}
                    {message && <p className={styles.notice}>{message}</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleAdd} disabled={adding || available < 1}>
                        {adding ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </article>
    );
};

const ProductList = ({ slug, preview = false }) => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = preview ? "" : searchParams.get("q") || "";
    const selectedSlug = preview ? "" : slug || searchParams.get("category") || "";
    const minPrice = preview ? "" : searchParams.get("minPrice") || "";
    const maxPrice = preview ? "" : searchParams.get("maxPrice") || "";
    const category = categories.find((item) => item.slug === selectedSlug);
    const [sort, setSort] = useState("default");
    const [result, setResult] = useState(null);
    const requestKey = JSON.stringify([selectedSlug, keyword, sort]);
    const currentResult = result?.key === requestKey ? result : null;
    const products = (currentResult?.products ?? []).filter((product) => {
        const price = Number(product.minPrice);
        return (minPrice === "" || price >= Number(minPrice)) &&
            (maxPrice === "" || price <= Number(maxPrice));
    });
    const error = currentResult?.error;
    const loading = currentResult === null;
    const pageSize = 12;
    const totalPages = Math.ceil(products.length / pageSize);
    const pageParam = Number(searchParams.get("page") || 1);
    const requestedPage = Number.isSafeInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const currentPage = Math.min(requestedPage, Math.max(totalPages, 1));
    const startIndex = preview ? 0 : (currentPage - 1) * pageSize;
    const visibleProducts = products.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        let cancelled = false;
        getCatalogProducts({
            slug: selectedSlug || undefined,
            keyword: keyword || undefined,
            sort,
        })
            .then((data) => {
                if (!cancelled) {
                    setResult({key: requestKey, products: Array.isArray(data) ? data : []});
                }
            })
            .catch((failure) => {
                if (!cancelled) {
                    setResult({
                        key: requestKey,
                        error: failure.response?.data?.message || "Không tải được danh sách sản phẩm.",
                    });
                }
            });
        return () => { cancelled = true; };
    }, [selectedSlug, keyword, sort, requestKey]);

    const title = keyword ? `Kết quả cho “${keyword}”` : (category?.label || "Sản phẩm");

    function search(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const fromPrice = formData.get("minPrice");
        const toPrice = formData.get("maxPrice");
        const maxPriceInput = event.currentTarget.elements.namedItem("maxPrice");
        if (fromPrice !== "" && toPrice !== "" && Number(fromPrice) > Number(toPrice)) {
            maxPriceInput.setCustomValidity("Giá đến phải lớn hơn hoặc bằng giá từ.");
            maxPriceInput.reportValidity();
            return;
        }
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        const value = formData.get("keyword").trim();
        if (value) params.set("q", value);
        else params.delete("q");
        if (fromPrice !== "") params.set("minPrice", fromPrice);
        else params.delete("minPrice");
        if (toPrice !== "") params.set("maxPrice", toPrice);
        else params.delete("maxPrice");
        setSearchParams(params);
    }

    function changeCategory(value) {
        const params = new URLSearchParams(searchParams);
        params.delete("page");
        if (value) params.set("category", value);
        else params.delete("category");
        navigate({pathname: "/search", search: params.toString()});
    }

    return (
        <section className={preview ? styles.preview : styles.page}>
            {!preview && <nav className={styles.breadcrumb}>
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <span>{category?.label || "Tìm kiếm sản phẩm"}</span>
            </nav>}
            {preview ? <h2 className={styles.title}>Sản phẩm</h2> : <h1 className={styles.title}>{title}</h1>}
            <div>
                {!preview && <div className={styles.filters}>
                    <Form id="catalog-search-form" key={JSON.stringify([keyword, minPrice, maxPrice])}
                          onSubmit={search} className={styles.searchForm}>
                        <Form.Group controlId="catalogKeyword">
                            <Form.Label>Tìm sản phẩm</Form.Label>
                            <Form.Control name="keyword" type="search" defaultValue={keyword}
                                          placeholder="Tên hoặc mã SKU..." />
                        </Form.Group>
                    </Form>
                    <Form.Group controlId="catalogCategory">
                        <Form.Label>Danh mục</Form.Label>
                        <Form.Select value={selectedSlug} onChange={(event) => changeCategory(event.target.value)}>
                            <option value="">Tất cả danh mục</option>
                            {categories.map((item) => (
                                <option key={item.slug} value={item.slug}>{item.label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="catalogMinPrice" key={`min-${minPrice}`}>
                        <Form.Label>Giá từ (VND)</Form.Label>
                        <Form.Control type="number" name="minPrice" form="catalog-search-form"
                                      min="0" step="1" defaultValue={minPrice} placeholder="Không giới hạn"
                                      onInput={(event) => {
                                          event.currentTarget.form.elements.namedItem("maxPrice").setCustomValidity("");
                                      }} />
                    </Form.Group>
                    <Form.Group controlId="catalogMaxPrice" key={`max-${maxPrice}`}>
                        <Form.Label>Giá đến (VND)</Form.Label>
                        <Form.Control type="number" name="maxPrice" form="catalog-search-form"
                                      min="0" step="1" defaultValue={maxPrice} placeholder="Không giới hạn"
                                      onInput={(event) => event.currentTarget.setCustomValidity("")} />
                    </Form.Group>
                    <button className={styles.searchButton} type="submit" form="catalog-search-form">
                        Tìm kiếm
                    </button>
                    <button type="reset" form="catalog-search-form" className={styles.resetButton}
                            title="Đặt lại bộ lọc" onClick={() => {
                                setSort("default");
                                navigate("/search");
                            }}>
                        <RotateCcw size={18} />
                    </button>
                </div>}
                <div className={styles.results}>
                    {!preview && <div className={styles.toolbar}>
                        <p>{!loading && !error ? `${products.length} sản phẩm` : ""}</p>
                        <div className={styles.sort}>
                            <Form.Label htmlFor="product-sort" className="mb-0">Sắp xếp</Form.Label>
                            <Form.Select id="product-sort" value={sort} onChange={(event) => {
                                setSort(event.target.value);
                                const params = new URLSearchParams(searchParams);
                                params.delete("page");
                                setSearchParams(params);
                            }}>
                                <option value="default">Mặc định</option>
                                <option value="price-asc">Giá thấp đến cao</option>
                                <option value="price-desc">Giá cao đến thấp</option>
                            </Form.Select>
                        </div>
                    </div>}
                    {loading && <p role="status">Đang tải sản phẩm...</p>}
                    {error && <p role="alert">{error}</p>}
                    {!loading && !error && products.length === 0 && (
                        <p>Không có sản phẩm phù hợp.</p>
                    )}
                    <div className={styles.grid}>
                        {visibleProducts.map((product) => (
                            <ProductCard key={`${requestKey}-${product.id}`} product={product} />
                        ))}
                    </div>
                    {!preview && !loading && !error && <div className={styles.pagination}>
                        <CatalogPagination currentPage={currentPage} totalPages={totalPages}
                                           onPageChange={(page) => {
                                               const params = new URLSearchParams(searchParams);
                                               params.set("page", String(page));
                                               setSearchParams(params);
                                           }} />
                    </div>}
                </div>
            </div>
            {preview && <div className={styles.viewMore}>
                <Link to="/search">Xem thêm</Link>
            </div>}
        </section>
    );
};

export default ProductList;
