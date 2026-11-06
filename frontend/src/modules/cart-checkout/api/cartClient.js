import axios from 'axios';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080/api/v1';

const cartClient = axios.create({
    baseURL: BACKEND_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 7000,
});

cartClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.id) {
            config.headers['X-User-Id'] = user.id;
        }
    } catch {
        // bỏ qua nếu parse lỗi
    }
    return config;
});

cartClient.interceptors.response.use(
    (response) => response.data,
    (error) => Promise.reject(error)
);

export default cartClient;

