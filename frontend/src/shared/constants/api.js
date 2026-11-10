export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const AUTH_ENDPOINTS = {
    CSRF: '/auth/csrf',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    SET_PASSWORD: '/auth/set-password',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
};

export const ADMIN_ENDPOINTS = {
    STAFF: '/admin/staff',
    CUSTOMERS: '/admin/customers',
};
