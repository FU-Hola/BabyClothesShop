import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminRoute from './AdminRoute';
import Home from '../pages/Home/Home';
import RegisterPage from '../../modules/auth/pages/RegisterPage/RegisterPage';
import LoginPage from '../../modules/auth/pages/LoginPage/LoginPage';

const AdminLayout = lazy(() => import('../layouts/AdminLayout/AdminLayout'));
const AccountManagementPage = lazy(
    () => import('../../modules/account/pages/AccountManagementPage/AccountManagementPage')
);
const ExceptionPage = lazy(() => import('../pages/ExceptionPage/ExceptionPage'));

const AppRoutes = () => {
    return (
        <Suspense
            fallback={(
                <div className="d-flex align-items-center justify-content-center min-vh-100" role="status">
                    Đang tải trang...
                </div>
            )}
        >
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route element={<AdminRoute />}>
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="staff" replace />} />
                        <Route path="accounts" element={<Navigate to="/admin/staff" replace />} />
                        <Route path="staff" element={<AccountManagementPage key="staff" accountType="staff" />} />
                        <Route path="customers" element={<AccountManagementPage key="customer" accountType="customer" />} />
                    </Route>
                </Route>
                <Route path="/403" element={<ExceptionPage statusCode={403} />} />
                <Route path="/404" element={<ExceptionPage statusCode={404} />} />
                <Route path="*" element={<ExceptionPage statusCode={404} />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
