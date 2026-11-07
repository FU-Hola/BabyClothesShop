import { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { LogOut, MapPin, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../modules/auth/hooks/useAuth';
import { getRoleHomePath } from '../../constants/auth';
import styles from './Header.module.css';

const Header = () => {
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch {
            // AuthProvider vẫn xóa user local nếu request logout gặp lỗi mạng.
        } finally {
            setLoggingOut(false);
            navigate('/', { replace: true });
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <div className={`${styles.location} d-flex align-items-center gap-2`}>
                    <MapPin size={18} strokeWidth={1.3} aria-hidden="true" />
                    <span>khu vực của bạn: Miền Bắc</span>
                </div>

                <div className={`${styles.right} d-flex align-items-center gap-3 flex-wrap justify-content-end`}>
                    <p className={styles.welcome}>chào mừng đến với baby shoppe</p>
                    <nav className={`${styles.account} d-flex align-items-center gap-2`} aria-label="Tài khoản">
                        <UserRound size={20} strokeWidth={1.3} aria-hidden="true" />
                        {loading ? (
                            <Spinner animation="border" size="sm" aria-label="Đang kiểm tra đăng nhập" />
                        ) : user ? (
                            <>
                                <Link
                                    to={getRoleHomePath(user.role)}
                                    className="text-decoration-none fw-semibold"
                                    title={user.email}
                                >
                                    {user.fullName || user.email}
                                </Link>
                                <span className={styles.divider} aria-hidden="true">|</span>
                                <Button
                                    type="button"
                                    variant="link"
                                    disabled={loggingOut}
                                    onClick={() => void handleLogout()}
                                    className={`${styles.logoutButton} d-inline-flex align-items-center gap-1 p-0 border-0 text-decoration-none`}
                                >
                                    <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
                                    {loggingOut ? 'đang đăng xuất...' : 'đăng xuất'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-decoration-none">đăng nhập</Link>
                                <span className={styles.divider} aria-hidden="true">|</span>
                                <Link to="/register" className="text-decoration-none">đăng ký</Link>
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
