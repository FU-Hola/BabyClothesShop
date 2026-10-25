import { NavLink } from "react-router-dom";
import styles from "./CategoryMenu.module.css";

const categories = [
    { to: "/ao-so-mi", firstLine: "áo sơ mi" },
    { to: "/ao-thun", firstLine: "áo thun" },
    { to: "/thoi-trang", firstLine: "thời trang" },
    { to: "/ao-khoac", firstLine: "áo khoác" },
    { to: "/quan-jean", firstLine: "quần jean" },
    { to: "/quan-dai", firstLine: "quần dài" },
    { to: "/quan-short", firstLine: "quần short" }

];

const CategoryMenu = () => {
    return (
        <nav className={styles.menu} aria-label="Danh mục sản phẩm">
            <ul className={styles.list}>
                {categories.map((category) => (
                    <li className={styles.item} key={category.to}>
                        <NavLink
                            to={category.to}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            <span>{category.firstLine}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryMenu;
