import { Link, NavLink } from 'react-router-dom';
import { Nav, Offcanvas, Stack } from 'react-bootstrap';
import {
    Boxes,
    ChevronRight,
    ClipboardList,
    LogOut,
    PackageSearch,
    ShieldCheck,
    ShoppingBag,
    Store,
    UserRoundCog,
    UsersRound,
} from 'lucide-react';
import styles from './AdminSidebar.module.css';

const upcomingItems = [
    { label: 'Sản phẩm', icon: ShoppingBag },
    { label: 'Đơn hàng', icon: ClipboardList },
    { label: 'Kho hàng', icon: Boxes },
    { label: 'Nhập & đóng gói', icon: PackageSearch },
];

const AdminSidebar = ({ show, onClose, onLogout }) => (
    <Offcanvas
        responsive="lg"
        show={show}
        onHide={onClose}
        className={styles.sidebar}
        aria-label="Menu quản trị"
    >
        <Offcanvas.Header closeButton closeVariant="white" className={styles.header}>
            <Offcanvas.Title>
                <Link className={styles.brand} to="/admin/staff" onClick={onClose}>
                    <span className={styles.brandIcon}>
                        <ShieldCheck size={22} aria-hidden="true" />
                    </span>
                    <span>
                        <strong>BaBy Admin</strong>
                        <small>Management Center</small>
                    </span>
                </Link>
            </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className={styles.body}>
            <Nav className="flex-column flex-grow-1" aria-label="Điều hướng quản trị">
                <p className={styles.navLabel}>Quản trị</p>
                <NavLink
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    to="/admin/staff"
                    onClick={onClose}
                >
                    <UserRoundCog size={19} aria-hidden="true" />
                    <span>Nhân viên</span>
                    <ChevronRight className="ms-auto" size={16} aria-hidden="true" />
                </NavLink>
                <NavLink
                    className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
                    to="/admin/customers"
                    onClick={onClose}
                >
                    <UsersRound size={19} aria-hidden="true" />
                    <span>Khách hàng</span>
                    <ChevronRight className="ms-auto" size={16} aria-hidden="true" />
                </NavLink>

                <p className={styles.navLabel}>Vận hành</p>
                {upcomingItems.map(({ label, icon: Icon }) => (
                    <Nav.Item className={`${styles.navItem} ${styles.disabledItem}`} key={label} aria-disabled="true">
                        <Icon size={19} aria-hidden="true" />
                        <span>{label}</span>
                        <small className="ms-auto">Sắp có</small>
                    </Nav.Item>
                ))}
            </Nav>

            <Stack gap={1} className={styles.footer}>
                <Nav.Link as={Link} to="/" className={styles.footerItem}>
                    <Store size={18} aria-hidden="true" />
                    <span>Xem cửa hàng</span>
                </Nav.Link>
                <Nav.Link as="button" type="button" className={styles.footerItem} onClick={onLogout}>
                    <LogOut size={18} aria-hidden="true" />
                    <span>Đăng xuất</span>
                </Nav.Link>
            </Stack>
        </Offcanvas.Body>
    </Offcanvas>
);

export default AdminSidebar;
