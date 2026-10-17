

import { Button, Form } from "react-bootstrap";
import styles from "./ProductList.module.css";
import { SlidersHorizontal } from "lucide-react";

const products = [
    {
        id: 1,
        name: "Áo Sơ Mi Tay Dài Bé Trai",
        brand: "GAP",
        price: 950000,
        image: "/products/ao-so-mi-be-trai.jpg",
        badge: "NEW ARRIVAL",
    },
    {
        id: 2,
        name: "Áo Sơ Mi Tay Dài Bé Gái",
        brand: "GAP",
        price: 399000,
        originalPrice: 850000,
        image: "/products/ao-so-mi-be-gai.jpg",
        discount: "-53%",
    },
];


const ProductList = () => {
    return (
        <>
            <div className={styles.page}>
                <h1 className={styles.title}>Áo sơ mi </h1>
                <div className={styles.toolbar}>
                    <Button type="button" variant="link" className={styles.filterButton}>
                        <SlidersHorizontal size={18} aria-hidden="true" /> Bộ lọc
                    </Button>
                    <div className={styles.sort}>
                        <Form.Label htmlFor="product-sort" className="mb-0">Sắp xếp: </Form.Label>
                        <Form.Select id="product-sort" defaultValue="default">
                            <option value="default">Mặc định</option>
                            <option value="price-asc"> Giá thấp đến cao</option>
                            <option value="price-desc">Giá cao đến thấp</option>
                        </Form.Select>
                    </div>
                </div>

                <p>{products.length} sản phẩm</p>
                <div className={styles.grid}>
                    {products.map((product) => (
                        <article className={styles.card} key={product.id}>
                            <div className={styles.imageBox}>
                                <img src={product.image} alt={product.name} />
                                {product.badge ? (<span className={styles.newBadge}>{product.badge}</span>) : null}
                                {product.discount ? (<span className={styles.discountBadge}>{product.discount}</span>) : null}
                            </div>
                            <div className={styles.info}>
                                <strong>{product.brand}</strong>
                                <p>{product.name}</p>
                                <div className={styles.prices}>
                                    <strong>{product.price}</strong>
                                    {product.originalPrice ? (<del>{product.originalPrice}</del>) : null}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </>
    )
}

export default ProductList;
