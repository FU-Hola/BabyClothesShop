import axiosClient from '../../../shared/api/axiosClient';
import { ADMIN_ENDPOINTS } from '../../../shared/constants/api';

const getResource = (accountType) => (
    accountType === 'staff' ? ADMIN_ENDPOINTS.STAFF : ADMIN_ENDPOINTS.CUSTOMERS
);

// Backend bọc dữ liệu trong ApiResponse; UI cần cả data và message nghiệp vụ.
const unwrap = (response) => ({
    ...(response.data || {}),
    message: response.message,
});

const accountApi = {
    getAccounts: async (accountType, params) => unwrap(
        await axiosClient.get(getResource(accountType), { params })
    ),
    getAccount: async (accountType, id) => unwrap(
        await axiosClient.get(`${getResource(accountType)}/${id}`)
    ),
    createAccount: async (accountType, data) => unwrap(
        await axiosClient.post(getResource(accountType), data)
    ),
    updateAccount: async (accountType, id, data) => unwrap(
        await axiosClient.put(`${getResource(accountType)}/${id}`, data)
    ),
    sendPasswordLink: async (id) => unwrap(
        await axiosClient.post(`${ADMIN_ENDPOINTS.STAFF}/${id}/send-password-link`)
    ),
    updateStatus: async (accountType, id, status) => unwrap(
        await axiosClient.patch(`${getResource(accountType)}/${id}/status`, { status })
    ),
    softDelete: async (accountType, id) => unwrap(
        await axiosClient.delete(`${getResource(accountType)}/${id}`)
    ),
    restore: async (accountType, id) => unwrap(
        await axiosClient.patch(`${getResource(accountType)}/${id}/restore`)
    ),
};

export default accountApi;
