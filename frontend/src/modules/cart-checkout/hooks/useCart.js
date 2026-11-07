import { useContext } from 'react';
import CartContext from '../context/CartContext.js';

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được sử dụng bên trong CartProvider');
    }
    return context;
};
