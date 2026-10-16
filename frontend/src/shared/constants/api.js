export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
};

export const ADMIN_ENDPOINTS = {
    STAFF: '/admin/staff',
    CUSTOMERS: '/admin/customers',
};
