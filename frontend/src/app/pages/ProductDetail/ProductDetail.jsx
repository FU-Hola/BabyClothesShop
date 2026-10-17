import { Link } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import styles from "./ProductDetail.module.css";

// Dữ liệu mẫu: thay các đường dẫn bằng ảnh thật trong frontend/public/products/.
const product = {
    id: 1,
    brand: "GAP",
    name: "Áo Sơ Mi Tay Dài Bé Trai",
    price: 950000,
    color: "Pine Tree Print",
    material: "100% cotton",
    images: [
        { src: "/products/ao-so-mi-be-trai.jpg", label: "Mặt trước" },
        { src: "/products/ao-so-mi-be-trai-sau.jpg", label: "Mặt sau" },
        { src: "/products/ao-so-mi-be-trai-chi-tiet.jpg", label: "Chi tiết" },
    ],
};

const sizes = ["XS", "S", "M", "L", "XL"];

const recommendations = [
    { id: 2, brand: "GAP", name: "Áo Sơ Mi Tay Dài Bé Gái", price: 399000, originalPrice: 850000, image: "/products/ao-so-mi-be-gai.jpg" },
    { id: 3, brand: "GAP", name: "Áo Sơ Mi Bé Trai Kẻ Caro", price: 1050000, image: "/products/ao-so-mi-be-trai-caro.jpg" },
    { id: 4, brand: "GAP", name: "Áo Thun Tay Ngắn Bé Trai", price: 750000, image: "/products/ao-thun-be-trai.jpg" },
    { id: 5, brand: "GAP", name: "Áo Thun Tay Dài Bé Trai", price: 950000, image: "/products/ao-thun-tay-dai-be-trai.jpg" },
];

const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(price)} đ`;

const ProductImage = ({ src, alt, className }) => (
    <div className={className} role="img" aria-label={alt} style={{ backgroundImage: `url("${src}")` }} />
);

const ProductDetail = () => {
    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
                <Link to="/">Trang chủ</Link>
                <span aria-hidden="true">›</span>
                <Link to="/ao-so-mi">Áo sơ mi</Link>
                <span aria-hidden="true">›</span>
                <span aria-current="page">{product.name}</span>
            </nav>

            <section className={styles.detail} aria-labelledby="product-name">
                <div className={styles.gallery}>
                    <div className={styles.thumbnails} aria-label="Ảnh sản phẩm">
                        {product.images.map((image, index) => (
                            <div
                                key={image.label}
                                className={`${styles.thumbnail} ${index === 0 ? styles.thumbnailActive : ""}`}
                            >
                                <ProductImage src={image.src} alt={`${product.name} - ${image.label}`} className={styles.thumbnailImage} />
                            </div>
                        ))}
                    </div>
                    <div className={styles.mainImage}>
                        <ProductImage
                            src={product.images[0].src}
                            alt={`${product.name} - ${product.images[0].label}`}
                            className={styles.heroImage}
                        />
                    </div>
                </div>

                <div className={styles.details}>
                    <div className={styles.heading}>
                        <span className={styles.brand}>{product.brand}</span>
                        <h1 id="product-name">{product.name}</h1>
                        <strong className={styles.price}>{formatPrice(product.price)}</strong>
                    </div>

                    <div className={styles.options}>
                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Màu sắc: <span>{product.color}</span></p>
                            <span className={styles.colorSwatch} aria-label={`Màu ${product.color}`} />
                        </div>

                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Kích cỡ</p>
                            <div className={styles.sizeList}>
                                {sizes.map((size) => (
                                    <span key={size} className={styles.sizeButton}>
                                        {size}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.optionGroup}>
                            <p className={styles.optionLabel}>Số lượng</p>
                            <div className={styles.quantity}>
                                <span className={styles.quantityIcon} aria-hidden="true">
                                    <Minus size={16} aria-hidden="true" />
                                </span>
                                <span className={styles.quantityValue}>1</span>
                                <span className={styles.quantityIcon} aria-hidden="true">
                                    <Plus size={16} aria-hidden="true" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.addToCart}>Thêm vào giỏ hàng</button>
                        <button type="button" className={styles.buyNow}>Mua ngay</button>
                    </div>

                    <section className={styles.productTabs} aria-label="Chi tiết sản phẩm">
                        <input className={styles.tabInput} type="radio" name="product-tabs" id="product-info-tab" value="info" defaultChecked />
                        <input className={styles.tabInput} type="radio" name="product-tabs" id="product-brand-tab" value="brand" />

                        <div className={styles.tabNav}>
                            <label htmlFor="product-info-tab">Thông tin</label>
                            <label htmlFor="product-brand-tab">Thương hiệu</label>
                        </div>

                        <div className={styles.tabPanels}>
                            <div className={`${styles.tabPanel} ${styles.infoPanel}`}>
                                <dl>
                                    <div><dt>Màu sắc</dt><dd>{product.color}</dd></div>
                                    <div><dt>Chất liệu</dt><dd>{product.material}</dd></div>
                                </dl>
                            </div>
                            <div className={`${styles.tabPanel} ${styles.brandPanel}`}>
                                <div className={styles.brandLogo} aria-label="GAP">GAP</div>
                                <p>
                                    <strong>GAP</strong> là thương hiệu thời trang đến từ Mỹ, ra đời năm 1969
                                    tại San Francisco. Với phong cách năng động, thoải mái và hiện đại,
                                    GAP mang đến các thiết kế dễ mặc cho nam, nữ và trẻ em.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </section>

            <section className={styles.recommendations} aria-labelledby="recommendations-title">
                <h2 id="recommendations-title">Có thể bạn cũng thích</h2>
                <div className={styles.recommendationGrid}>
                    {recommendations.map((item) => (
                        <article className={styles.recommendationCard} key={item.id}>
                            <div className={styles.recommendationImage}>
                                <ProductImage src={item.image} alt={item.name} className={styles.cardImage} />
                            </div>
                            <div className={styles.cardInfo}>
                                <strong>{item.brand}</strong>
                                <p>{item.name}</p>
                                <div className={styles.cardPrices}>
                                    <strong>{formatPrice(item.price)}</strong>
                                    {item.originalPrice ? <del>{formatPrice(item.originalPrice)}</del> : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProductDetail;
