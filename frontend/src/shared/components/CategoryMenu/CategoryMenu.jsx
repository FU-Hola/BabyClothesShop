import { NavLink } from "react-router-dom";
import styles from "./CategoryMenu.module.css";

const categories = [
    { to: "/quan-ao-so-sinh", firstLine: "quần áo", secondLine: "sơ sinh" },
    { to: "/thoi-trang-be-gai", firstLine: "thời trang", secondLine: "bé gái" },
    { to: "/thoi-trang-be-trai", firstLine: "thời trang", secondLine: "bé trai" },
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
                            <span>{category.secondLine}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryMenu;
