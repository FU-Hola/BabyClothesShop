import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminTopbar from './components/AdminTopbar/AdminTopbar';
import useAuth from '../../../modules/auth/hooks/useAuth';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate('/login', { replace: true });
        }
    };

    return (
        <div className={styles.shell}>
            <AdminSidebar
                show={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={() => void handleLogout()}
            />

            <div className={styles.mainArea}>
                <AdminTopbar user={user} onOpenSidebar={() => setSidebarOpen(true)} />
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
