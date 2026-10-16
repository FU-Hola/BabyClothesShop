import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    Boxes,
    ChevronRight,
    ClipboardList,
    LogOut,
    Menu,
    PackageSearch,
    ShieldCheck,
    ShoppingBag,
    Store,
    Users,
    X,
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const upcomingItems = [
    { label: 'Sản phẩm', icon: ShoppingBag },
    { label: 'Đơn hàng', icon: ClipboardList },
    { label: 'Kho hàng', icon: Boxes },
    { label: 'Nhập & đóng gói', icon: PackageSearch },
];

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = getStoredUser();

    const closeSidebar = () => setSidebarOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={styles.shell}>
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.brandRow}>
                    <Link className={styles.brand} to="/admin/accounts" onClick={closeSidebar}>
                        <span className={styles.brandIcon}>
                            <ShieldCheck size={22} aria-hidden="true" />
                        </span>
                        <span>
                            <strong>BaBy Admin</strong>
                            <small>Management Center</small>
                        </span>
                    </Link>
                    <button className={styles.closeButton} type="button" onClick={closeSidebar} aria-label="Đóng menu">
                        <X size={22} />
                    </button>
                </div>

                <nav className={styles.navigation} aria-label="Điều hướng quản trị">
                    <p className={styles.navLabel}>Quản trị</p>
                    <NavLink
                        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                        to="/admin/accounts"
                        onClick={closeSidebar}
                    >
                        <Users size={19} aria-hidden="true" />
                        <span>Quản lý tài khoản</span>
                        <ChevronRight className={styles.navArrow} size={16} aria-hidden="true" />
                    </NavLink>

                    <p className={styles.navLabel}>Vận hành</p>
                    {upcomingItems.map(({ label, icon: Icon }) => (
                        <div className={`${styles.navItem} ${styles.disabledItem}`} key={label} aria-disabled="true">
                            <Icon size={19} aria-hidden="true" />
                            <span>{label}</span>
                            <small>Sắp có</small>
                        </div>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <Link to="/" className={styles.storeLink}>
                        <Store size={18} aria-hidden="true" />
                        <span>Xem cửa hàng</span>
                    </Link>
                    <button type="button" onClick={handleLogout}>
                        <LogOut size={18} aria-hidden="true" />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {sidebarOpen && (
                <button className={styles.backdrop} type="button" onClick={closeSidebar} aria-label="Đóng menu" />
            )}

            <div className={styles.mainArea}>
                <header className={styles.topbar}>
                    <button
                        className={styles.menuButton}
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Mở menu quản trị"
                    >
                        <Menu size={23} />
                    </button>
                    <div>
                        <p className={styles.eyebrow}>Admin dashboard</p>
                        <h1>Trung tâm quản trị</h1>
                    </div>
                    <div className={styles.adminProfile}>
                        <span className={styles.avatar}>{user?.fullName?.charAt(0).toUpperCase() || 'A'}</span>
                        <span className={styles.profileText}>
                            <strong>{user?.fullName || 'Quản trị viên'}</strong>
                            <small>Administrator</small>
                        </span>
                    </div>
                </header>
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
