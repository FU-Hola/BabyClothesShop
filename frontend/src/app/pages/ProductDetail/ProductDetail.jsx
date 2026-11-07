import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { getCatalogProduct, getCatalogProducts } from "../../../shared/api/catalogApi.js";
import { useCart } from "../../../modules/cart-checkout/context/CartContext.jsx";
import categories from "../../../shared/constants/categories.js";
import styles from "./ProductDetail.module.css";

const FALLBACK_IMAGE = "/images/products/sample-baby-romper.png";
const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(price)} đ`;

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [error, setError] = useState("");
    const [variantId, setVariantId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setProduct(null);
        setError("");
        getCatalogProduct(productId)
            .then((data) => {
                if (cancelled) return;
                setProduct(data);
                setVariantId(data.variants.find((item) => Number(item.availableStock) > 0)?.id ?? data.variants[0]?.id ?? "");
                setQuantity(1);
                setMessage("");
                return getCatalogProducts({ slug: data.categorySlug });
            })
            .then((items) => {
                if (!cancelled && Array.isArray(items)) {
                    setRelated(items.filter((item) => item.id !== productId).slice(0, 4));
                }
            })
            .catch((failure) => {
                if (!cancelled) setError(failure.response?.data?.message || "Không tìm thấy sản phẩm.");
            });
        return () => {
            cancelled = true;
        };
    }, [productId]);

    const variant = product?.variants.find((item) => item.id === variantId) ?? product?.variants[0];
    const colors = useMemo(() => [...new Set(product?.variants.map((item) => item.color) ?? [])], [product]);
    const sizes = product?.variants.filter((item) => item.color === variant?.color) ?? [];
    const available = Number(variant?.availableStock ?? 0);
    const category = categories.find((item) => item.slug === product?.categorySlug);
    const image = product?.imageUrl || FALLBACK_IMAGE;

    const changeQuantity = (next) => {
        setQuantity(Math.min(Math.max(available, 1), Math.max(1, next)));
    };

    const handleAdd = async () => {
        if (!variant || available < 1) {
            setMessage("Sản phẩm này đã hết hàng.");
            return { success: false };
        }
        setAdding(true);
        const result = await addToCart({
            id: product.id,
            variantId: variant.id,
            name: product.name,
            price: Number(variant.price),
            image,
            sku: variant.sku,
            maxStock: available,
        }, variant.size, quantity);
        setMessage(result.message);
        setAdding(false);
        return result;
    };

    if (error) {
        return <div className={styles.page}><p>{error}</p><Link to="/">Về trang chủ</Link></div>;
    }
    if (!product || !variant) {
        return <div className={styles.page}><p>Đang tải sản phẩm...</p></div>;
    }

    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
                <Link to="/">Trang chủ</Link>
                <span aria-hidden="true">›</span>
                <Link to={category?.path || "/"}>{product.categoryName}</Link>
                <span aria-hidden="true">›</span>
                <span aria-current="page">{product.name}</span>
            </nav>

            <section className={styles.detail} aria-labelledby="product-name">
                <div className={styles.gallery}>
                    <div className={styles.mainImage}>
                        <img src={image} alt={product.name} className={styles.heroImage} />
                    </div>
                </div>
                <div className={styles.details}>
                    <div className={styles.heading}>
                        <span className={styles.brand}>{product.categoryName}</span>
                        <h1 id="product-name">{product.name}</h1>
                        <strong className={styles.price}>{formatPrice(variant.price)}</strong>
                        {variant.originalPrice ? <del>{formatPrice(variant.originalPrice)}</del> : null}
                    </div>
                    <p>{product.description}</p>
                    <div className={styles.options}>
                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Màu sắc: <span>{variant.color}</span></p>
                            <div className={styles.sizeList}>
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={`${styles.sizeButton} ${color === variant.color ? styles.sizeButtonActive : ""}`}
                                        onClick={() => {
                                            const next = product.variants.find((item) => item.color === color);
                                            setVariantId(next.id);
                                            setQuantity(1);
                                        }}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Kích cỡ</p>
                            <div className={styles.sizeList}>
                                {sizes.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`${styles.sizeButton} ${item.id === variant.id ? styles.sizeButtonActive : ""}`}
                                        onClick={() => {
                                            setVariantId(item.id);
                                            setQuantity(1);
                                        }}
                                    >
                                        {item.size}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Số lượng {available < 1 ? "(hết hàng)" : `(còn ${available})`}</p>
                            <div className={styles.quantity}>
                                <button type="button" className={styles.quantityIcon} onClick={() => changeQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Giảm số lượng">
                                    <Minus size={16} />
                                </button>
                                <span className={styles.quantityValue}>{quantity}</span>
                                <button type="button" className={styles.quantityIcon} onClick={() => changeQuantity(quantity + 1)} disabled={available < 1 || quantity >= available} aria-label="Tăng số lượng">
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button type="button" className={styles.addToCart} onClick={handleAdd} disabled={adding || available < 1}>
                            {available < 1 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                        </button>
                        <button type="button" className={styles.buyNow} onClick={async () => {
                            const result = await handleAdd();
                            if (result.success) navigate("/cart");
                        }} disabled={adding || available < 1}>
                            Mua ngay
                        </button>
                    </div>
                    {message ? <p>{message}</p> : null}
                    <p>SKU: {variant.sku}</p>
                </div>
            </section>

            {related.length > 0 ? (
                <section className={styles.recommendations} aria-labelledby="recommendations-title">
                    <h2 id="recommendations-title">Có thể bạn cũng thích</h2>
                    <div className={styles.recommendationGrid}>
                        {related.map((item) => (
                            <Link className={styles.recommendationCard} key={item.id} to={`/san-pham/${item.id}`}>
                                <div className={styles.recommendationImage}>
                                    <img src={item.imageUrl || FALLBACK_IMAGE} alt={item.name} className={styles.cardImage} />
                                </div>
                                <div className={styles.cardInfo}>
                                    <p>{item.name}</p>
                                    <div className={styles.cardPrices}>
                                        <strong>{formatPrice(item.minPrice)}</strong>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            ) : null}
        </div>
    );
};

export default ProductDetail;
