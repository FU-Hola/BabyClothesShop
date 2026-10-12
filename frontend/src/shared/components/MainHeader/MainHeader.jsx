import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import cartIcon from "../../assets/cart-icon.svg";
import styles from "./MainHeader.module.css";

const MainHeader = () => {
    const navigate = useNavigate();

    const handleSearch = (event) => {
        event.preventDefault();
        const query = new FormData(event.currentTarget).get("q").trim();

        if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className={styles.header}>
            <div className={styles.inner}>
                <form className={styles.search} role="search" onSubmit={handleSearch}>
                    <input
                        type="search"
                        name="q"
                        aria-label="Tìm kiếm sản phẩm"
                        placeholder="nhập tên, mã số sản phẩm để tìm kiếm"
                    />
                    <button type="submit" aria-label="Tìm kiếm">
                        <Search size={26} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                </form>

                <Link className={styles.brand} to="/" aria-label="Baby Clothes Shop - Trang chủ">
                    BaBy Clothes Shop
                </Link>

                <Link className={styles.cart} to="/cart">
                    <span className={styles.cartText}>
                        <strong>giỏ hàng</strong>
                        <span>không có sản phẩm</span>
                    </span>
                    <img className={styles.cartIcon} src={cartIcon} alt="" width={27} height={33} />
                </Link>
            </div>
        </div>
    );
};

export default MainHeader;
