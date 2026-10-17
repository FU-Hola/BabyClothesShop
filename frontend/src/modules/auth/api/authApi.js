import axiosClient from '../../../shared/api/axiosClient';
import { AUTH_ENDPOINTS } from '../../../shared/constants/api';

const authApi = {
    register: (data) => axiosClient.post(AUTH_ENDPOINTS.REGISTER, data),
    login: (data) => axiosClient.post(AUTH_ENDPOINTS.LOGIN, data),
    getMe: () => axiosClient.get(AUTH_ENDPOINTS.ME),
};

export default authApi;
