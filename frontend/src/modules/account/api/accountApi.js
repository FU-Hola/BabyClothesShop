import axiosClient from '../../../shared/api/axiosClient';
import { ADMIN_ENDPOINTS } from '../../../shared/constants/api';

const accountApi = {
    getAccounts: (params) => axiosClient.get(ADMIN_ENDPOINTS.ACCOUNTS, { params }),
    createAccount: (data) => axiosClient.post(ADMIN_ENDPOINTS.ACCOUNTS, data),
    updateAccount: (id, data) => axiosClient.put(`${ADMIN_ENDPOINTS.ACCOUNTS}/${id}`, data),
    deleteAccount: (id) => axiosClient.delete(`${ADMIN_ENDPOINTS.ACCOUNTS}/${id}`),
};

export default accountApi;
