import { ArrowRight, ArrowUpRight, CodeXml, Shirt } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const quickLinks = [
    { to: "/danh-muc/ao-polo", label: "Áo Polo" },
    { to: "/danh-muc/ao-thun", label: "Áo Thun" },
    { to: "/search", label: "Tất cả sản phẩm" },
    { to: "/cart", label: "Giỏ hàng" },
];

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.columns}>
                    <section aria-label="Baby Clothes Shop" className={styles.about}>
                        <Link to="/" className={styles.brand} aria-label="Baby Clothes Shop - Trang chủ">
                            <span className={styles.logo}><Shirt size={25} strokeWidth={1.5} aria-hidden="true" /></span>
                            <span>Baby Clothes Shop<span className={styles.tagline}>TỦ ĐỒ NHỎ, NIỀM VUI TO</span></span>
                        </Link>
                        <p className={styles.description}>Khám phá những chiếc áo đáng yêu cho bé,<br />từ Polo đến áo thun mỗi ngày.</p>
                        <Link to="/search" className={styles.browse}>Khám phá bộ sưu tập <ArrowRight size={16} aria-hidden="true" /></Link>
                    </section>

                    <nav aria-labelledby="footer-links">
                        <h2 id="footer-links" className={styles.heading}>Khám phá</h2>
                        <ul className={styles.links}>
                            {quickLinks.map(({ to, label }) => <li key={to}><Link to={to}>{label}</Link></li>)}
                        </ul>
                    </nav>

                    <section aria-labelledby="footer-project">
                        <h2 id="footer-project" className={styles.heading}>Về dự án</h2>
                        <span className={styles.badge}>SBA301 · Group Project 3 </span>
                        <p className={styles.projectNote}>Website mô phỏng mua sắm và quản lý<br />cửa hàng quần áo trẻ em.</p>
                        <a className={styles.source} href="https://github.com/FU-Hola/BabyClothesShop"
                           target="_blank" rel="noopener noreferrer">
                            <CodeXml size={17} aria-hidden="true" /> Xem mã nguồn
                            <ArrowUpRight size={14} aria-hidden="true" />
                            <span className={styles.srOnly}> (mở trong tab mới)</span>
                        </a>
                    </section>
                </div>
                <div className={styles.bottomBar}>
                    <p>© {new Date().getFullYear()} Baby Clothes Shop</p>
                    <p>Được xây dựng cho mục đích học tập.</p>
                </div>
            </div>
        </footer>
    );
}
