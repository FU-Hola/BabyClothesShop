import axiosClient from '../../../shared/api/axiosClient';
import { AUTH_ENDPOINTS } from '../../../shared/constants/api';

const getData = (response) => response.data;

const authApi = {
    register: async (data) => getData(await axiosClient.post(AUTH_ENDPOINTS.REGISTER, data)),
    login: async (data) => getData(await axiosClient.post(AUTH_ENDPOINTS.LOGIN, data)),
    getMe: async () => getData(await axiosClient.get(AUTH_ENDPOINTS.ME)),
    logout: () => axiosClient.post(AUTH_ENDPOINTS.LOGOUT),
};

export default authApi;
