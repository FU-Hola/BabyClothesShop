import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar/AdminSidebar';
import AdminTopbar from './components/AdminTopbar/AdminTopbar';
import styles from './AdminLayout.module.css';

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

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={styles.shell}>
            <AdminSidebar
                show={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={handleLogout}
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
