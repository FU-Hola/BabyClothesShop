import { NavLink } from "react-router-dom";
import { useCatalogCategories } from "../../hooks/useCatalogCategories.js";
import styles from "./CategoryMenu.module.css";

const CategoryMenu = () => {
    const { data: categories = [], isPending, isError } = useCatalogCategories();
    return (
        <nav className={styles.menu} aria-label="Danh mục sản phẩm">
            {isPending && <p role="status">Đang tải danh mục...</p>}
            {isError && <p role="alert">Không tải được danh mục. Vui lòng thử lại.</p>}
            <ul className={styles.list}>
                {categories.map((category) => (
                    <li className={styles.item} key={category.id}>
                        <NavLink
                            to={`/danh-muc/${encodeURIComponent(category.slug)}`}
                            className={({ isActive }) =>
                                isActive ? `${styles.link} ${styles.active}` : styles.link
                            }
                        >
                            <span>{category.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryMenu;
