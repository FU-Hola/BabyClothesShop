import cartClient from './cartClient';
import { idempotentRequest } from '../../../shared/api/idempotentRequest.js';
const checkoutApi = {
    validateCheckout: (data) => idempotentRequest('checkout:create', data,
        (headers) => cartClient.post('/checkout/orders', data, { headers })),
    simulatePayment: (data) => idempotentRequest(`checkout:payment:${data.checkoutKey}`, data,
        (headers) => cartClient.post('/checkout/simulate-payment', data, { headers })),
    cancel: (key) => idempotentRequest(`checkout:cancel:${key}`, null,
        (headers) => cartClient.post(`/checkout/${encodeURIComponent(key)}/cancel`, null, { headers })),
    detail: (key) => cartClient.get(`/checkout/${encodeURIComponent(key)}`),
};
export default checkoutApi;
