import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout/AdminLayout';
import AdminRoute from './AdminRoute';
import Home from '../pages/Home/Home';
import RegisterPage from '../../modules/auth/pages/RegisterPage/RegisterPage';
import LoginPage from '../../modules/auth/pages/LoginPage/LoginPage';
import AccountManagementPage from '../../modules/account/pages/AccountManagementPage/AccountManagementPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>
            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Navigate to="accounts" replace />} />
                    <Route path="accounts" element={<AccountManagementPage />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
