import cartClient from './cartClient';

const checkoutApi = {
    validateCheckout: (data) => cartClient.post('/checkout/validate', data),
    simulatePayment: (data) => cartClient.post('/checkout/simulate-payment', data),
};

export default checkoutApi;

