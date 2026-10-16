import axiosClient from '../../../shared/api/axiosClient';
import { ADMIN_ENDPOINTS } from '../../../shared/constants/api';

const getResource = (accountType) => (
    accountType === 'staff' ? ADMIN_ENDPOINTS.STAFF : ADMIN_ENDPOINTS.CUSTOMERS
);

const accountApi = {
    getAccounts: (accountType, params) => axiosClient.get(getResource(accountType), { params }),
    getAccount: (accountType, id) => axiosClient.get(`${getResource(accountType)}/${id}`),
    createAccount: (accountType, data) => axiosClient.post(getResource(accountType), data),
    updateAccount: (accountType, id, data) => axiosClient.put(`${getResource(accountType)}/${id}`, data),
    updateStatus: (accountType, id, status) => axiosClient.patch(
        `${getResource(accountType)}/${id}/status`,
        { status }
    ),
    softDelete: (accountType, id) => axiosClient.delete(`${getResource(accountType)}/${id}`),
    restore: (accountType, id) => axiosClient.patch(`${getResource(accountType)}/${id}/restore`),
};

export default accountApi;
