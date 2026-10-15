import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home/Home';
import RegisterPage from '../../modules/auth/pages/RegisterPage/RegisterPage';
import LoginPage from '../../modules/auth/pages/LoginPage/LoginPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
