import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const quickLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/about", label: "Giới thiệu" },
    { to: "/quan-ao-so-sinh", label: "Quần áo sơ sinh" },
    { to: "/thoi-trang-be-gai", label: "Thời trang bé gái" },
    { to: "/thoi-trang-be-trai", label: "Thời trang bé trai" },
    { to: "/cart", label: "Giỏ hàng" },
];

const Footer = ({
    projectName = "[Tên dự án]",
    groupName = "[Tên nhóm]",
    className = "[Tên lớp]",
    universityName = "[Tên trường đại học]",
    sourceUrl = "https://github.com/midori-suzune/BabyClothesShop",
}) => {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.columns}>
                    <section aria-labelledby="footer-about">
                        <h2 id="footer-about" className={styles.heading}>Về dự án</h2>
                        <div className={styles.brand}>
                            <span className={styles.logo}>
                                <GraduationCap size={26} strokeWidth={1.6} aria-hidden="true" />
                            </span>
                            <span className={styles.projectName}>{projectName}</span>
                        </div>
                        <p className={styles.description}>
                            Đồ án sinh viên được phát triển cho học phần SBA301.
                        </p>
                        <dl className={styles.details}>
                            <div><dt>Nhóm:</dt><dd>{groupName}</dd></div>
                            <div><dt>Lớp:</dt><dd>{className}</dd></div>
                        </dl>
                    </section>

                    <nav aria-labelledby="footer-links">
                        <h2 id="footer-links" className={styles.heading}>Liên kết nhanh</h2>
                        <ul className={styles.links}>
                            {quickLinks.map(({ to, label }) => (
                                <li key={to}><Link to={to}>{label}</Link></li>
                            ))}
                        </ul>
                    </nav>

                    <section aria-labelledby="footer-info">
                        <h2 id="footer-info" className={styles.heading}>Thông tin dự án</h2>
                        <dl className={styles.details}>
                            <div><dt>Học phần:</dt><dd>SBA301</dd></div>
                            <div><dt>Trường:</dt><dd>{universityName}</dd></div>
                        </dl>
                        <a className={styles.source} href={sourceUrl} target="_blank" rel="noopener noreferrer">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M12 .297C5.37.297 0 5.67 0 12.297c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.838 1.237 1.838 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.467-1.334-5.467-5.93 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.118-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.656 1.652.244 2.873.12 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.625-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.595 24 12.297c0-6.627-5.373-12-12-12" />
                            </svg>
                            <span>Mã nguồn<span className={styles.srOnly}> (mở trong tab mới)</span></span>
                        </a>
                    </section>
                </div>

                <div className={styles.bottomBar}>
                    <p>© 2026 {projectName} · {groupName} · SBA301</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
