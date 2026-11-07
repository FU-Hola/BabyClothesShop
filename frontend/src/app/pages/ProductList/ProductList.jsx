import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Form } from "react-bootstrap";
import { Minus, Plus, SlidersHorizontal } from "lucide-react";
import { getCatalogProducts } from "../../../shared/api/catalogApi.js";
import { useCart } from "../../../modules/cart-checkout/context/CartContext.jsx";
import categories from "../../../shared/constants/categories.js";
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
    const variant = product.variants.find((item) => item.id === variantId) ?? product.variants[0];
    const available = Number(variant?.availableStock ?? 0);

    useEffect(() => {
        setVariantId(product.variants.find((item) => Number(item.availableStock) > 0)?.id ?? product.variants[0]?.id ?? "");
        setQuantity(1);
        setMessage("");
    }, [product.id, product.variants]);

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
        setAdding(false);
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
                    <strong>{formatPrice(variant?.price ?? product.minPrice)}</strong>
                    {variant?.originalPrice ? <del>{formatPrice(variant.originalPrice)}</del> : null}
                </div>
                <label className={styles.field}>
                    Size
                    <select value={variant?.id ?? ""} onChange={(event) => {
                        setVariantId(event.target.value);
                        setQuantity(1);
                    }}>
                        {product.variants.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.color} / {item.size} {item.availableStock < 1 ? "(hết hàng)" : `(còn ${item.availableStock})`}
                            </option>
                        ))}
                    </select>
                </label>
                <div className={styles.quantity}>
                    <button type="button" onClick={() => changeQuantity(quantity - 1)} aria-label="Giảm số lượng" disabled={quantity <= 1}>
                        <Minus size={14} />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => changeQuantity(quantity + 1)} aria-label="Tăng số lượng" disabled={available < 1 || quantity >= available}>
                        <Plus size={14} />
                    </button>
                </div>
                <div className={styles.cardActions}>
                    <button type="button" onClick={handleAdd} disabled={adding || available < 1}>
                        {available < 1 ? "Hết hàng" : adding ? "Đang thêm..." : "Thêm vào giỏ"}
                    </button>
                    <Link to={`/san-pham/${product.id}`}>Xem chi tiết</Link>
                </div>
                {message ? <p className={styles.notice}>{message}</p> : null}
            </div>
        </article>
    );
};

const ProductList = ({ slug }) => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get("q") || "";
    const category = categories.find((item) => item.slug === slug);
    const [sort, setSort] = useState("default");
    const [products, setProducts] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getCatalogProducts({
            slug: slug || undefined,
            keyword: keyword || undefined,
            sort,
        })
            .then((data) => {
                if (!cancelled) {
                    setProducts(Array.isArray(data) ? data : []);
                    setError("");
                }
            })
            .catch((failure) => {
                if (!cancelled) setError(failure.response?.data?.message || "Không tải được danh sách sản phẩm.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [slug, keyword, sort]);

    const title = keyword ? `Kết quả cho “${keyword}”` : (category?.label || "Sản phẩm");

    return (
        <div className={styles.page}>
            <h1 className={styles.title}>{title}</h1>
            <div className={styles.toolbar}>
                <Button type="button" variant="link" className={styles.filterButton}>
                    <SlidersHorizontal size={18} aria-hidden="true" /> Bộ lọc
                </Button>
                <div className={styles.sort}>
                    <Form.Label htmlFor="product-sort" className="mb-0">Sắp xếp: </Form.Label>
                    <Form.Select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                        <option value="default">Mặc định</option>
                        <option value="price-asc">Giá thấp đến cao</option>
                        <option value="price-desc">Giá cao đến thấp</option>
                    </Form.Select>
                </div>
            </div>
            {loading ? <p>Đang tải sản phẩm...</p> : null}
            {error ? <p>{error}</p> : null}
            {!loading && !error ? <p>{products.length} sản phẩm</p> : null}
            {!loading && !error && products.length === 0 ? (
                <p>Danh mục này chưa có sản phẩm đang kinh doanh.</p>
            ) : null}
            <div className={styles.grid}>
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default ProductList;
