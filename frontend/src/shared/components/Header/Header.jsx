import { MapPin, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={styles.location}>
                    <MapPin size={18} strokeWidth={1.3} aria-hidden="true" />
                    <span>khu vực của bạn: Miền Bắc</span>
                </div>

                <div className={styles.right}>
                    <p className={styles.welcome}>chào mừng đến với baby shoppe</p>
                    <nav className={styles.account} aria-label="Tài khoản">
                        <UserRound size={20} strokeWidth={1.3} aria-hidden="true" />
                        <Link to="/login">đăng nhập</Link>
                        <span className={styles.divider} aria-hidden="true">|</span>
                        <Link to="/register">đăng ký</Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
