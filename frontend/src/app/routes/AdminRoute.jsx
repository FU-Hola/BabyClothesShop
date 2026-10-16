import { Navigate, Outlet, useLocation } from 'react-router-dom';

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch {
        return null;
    }
};

const AdminRoute = () => {
    const location = useLocation();
    const token = localStorage.getItem('accessToken');
    const user = getStoredUser();

    if (!token || !user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (user.role !== 'admin' || user.status !== 'active' || user.deletedAt) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
