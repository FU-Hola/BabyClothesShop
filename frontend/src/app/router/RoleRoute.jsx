import { Spinner } from 'react-bootstrap';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../modules/auth/hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
    const location = useLocation();
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <Spinner animation="border" role="status" aria-label="Đang kiểm tra đăng nhập" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    if (user.status !== 'ACTIVE' || !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
};

export default RoleRoute;
