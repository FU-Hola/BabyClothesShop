import cartClient from './cartClient';

const cartApi = {
    getCart: () => cartClient.get('/cart'),
    addToCart: (data) => cartClient.post('/cart/items', data),
    updateQuantity: (cartItemId, data) => cartClient.put(`/cart/items/${cartItemId}`, data),
    removeItem: (cartItemId) => cartClient.delete(`/cart/items/${cartItemId}`),
    clearCart: () => cartClient.delete('/cart'),
};

export default cartApi;

