import axios from 'axios';
import { API_BASE_URL, AUTH_ENDPOINTS } from '../constants/api';

// Transport riêng dùng cho CSRF/refresh để không chạy lặp qua interceptor chính.
const authTransport = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    // Trình duyệt tự gửi accessToken và refreshToken trong HttpOnly cookie.
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

const SAFE_METHODS = new Set(['get', 'head', 'options']);
let refreshPromise = null;

const getCsrfToken = async () => {
    const response = await authTransport.get(AUTH_ENDPOINTS.CSRF);
    const token = response.data?.data?.token;

    if (!token) {
        throw new Error('Backend không trả CSRF token');
    }
    return token;
};

const refreshAccessToken = () => {
    if (!refreshPromise) {
        refreshPromise = getCsrfToken()
            .then((token) => authTransport.post(
                AUTH_ENDPOINTS.REFRESH,
                null,
                { headers: { 'X-XSRF-TOKEN': token } }
            ))
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

// Với request làm thay đổi dữ liệu, lấy CSRF token thật từ Spring Security.
axiosClient.interceptors.request.use(
    async (config) => {
        const method = config.method?.toLowerCase() || 'get';
        if (!SAFE_METHODS.has(method) && config.url !== AUTH_ENDPOINTS.CSRF) {
            config.headers['X-XSRF-TOKEN'] = await getCsrfToken();
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Giữ nguyên ApiResponse của backend và tự refresh access cookie một lần khi hết hạn.
axiosClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const request = error.config;
        const skipRefresh = [
            AUTH_ENDPOINTS.LOGIN,
            AUTH_ENDPOINTS.REGISTER,
            AUTH_ENDPOINTS.REFRESH,
        ].includes(request?.url);

        if (error.response?.status === 401 && request && !request._retry && !skipRefresh) {
            request._retry = true;
            try {
                await refreshAccessToken();
                return axiosClient(request);
            } catch {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;
