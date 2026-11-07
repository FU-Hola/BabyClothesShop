import { useEffect, useState } from 'react';
import useAuth from '../../auth/hooks/useAuth.js';
import cartApi from '../api/cartApi.js';
import CartContext from './CartContext.js';

const readItems = (response) => {
    if (!response?.success || !Array.isArray(response.data?.items)) {
        throw new Error('Không nhận được giỏ hàng hợp lệ từ máy chủ.');
    }
    return response.data.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        productId: item.productId,
        name: item.productName,
        size: item.size,
        color: item.color,
        price: Number(item.price),
        quantity: item.quantity,
        maxStock: item.availableStock,
        image: item.imageUrl || '/images/products/sample-baby-romper.png',
        sku: item.sku,
    }));
};

const errorMessage = (error) => error.response?.data?.message || error.message || 'Không thể cập nhật giỏ hàng.';

const CustomerCartProvider = ({ customerId, children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [lastOrder, setLastOrder] = useState(null);
    const [cartLoading, setCartLoading] = useState(Boolean(customerId));
    const [cartError, setCartError] = useState('');

    useEffect(() => {
        // Bỏ dữ liệu demo và dữ liệu dùng chung giữa các tài khoản của phiên bản cũ.
        localStorage.removeItem('baby_cart_items');
        localStorage.removeItem('baby_last_order');
        if (!customerId) return;

        let active = true;
        cartApi.getCart()
            .then((response) => {
                const items = readItems(response);
                if (active) setCartItems(items);
            })
            .catch((error) => {
                if (active) setCartError(errorMessage(error));
            })
            .finally(() => {
                if (active) setCartLoading(false);
            });
        return () => { active = false; };
    }, [customerId]);

    const syncCartFromBackend = async () => {
        if (!customerId) return;
        setCartLoading(true);
        try {
            setCartItems(readItems(await cartApi.getCart()));
            setCartError('');
        } catch (error) {
            setCartError(errorMessage(error));
        } finally {
            setCartLoading(false);
        }
    };

    const updateCart = async (request) => {
        if (!customerId) {
            return { success: false, message: 'Vui lòng đăng nhập bằng tài khoản khách hàng để sử dụng giỏ hàng.' };
        }
        if (cartLoading) {
            return { success: false, message: 'Giỏ hàng đang tải. Vui lòng thử lại sau.' };
        }
        try {
            setCartItems(readItems(await request()));
            setCartError('');
            return { success: true, message: 'Đã cập nhật giỏ hàng thành công.' };
        } catch (error) {
            return { success: false, message: errorMessage(error) };
        }
    };

    const addToCart = (product, size, quantity = 1) => {
        if (!product.variantId) {
            return Promise.resolve({ success: false, message: 'Vui lòng chọn sản phẩm đang kinh doanh.' });
        }
        return updateCart(() => cartApi.addToCart({ variantId: product.variantId, quantity }));
    };

    const removeFromCart = (id) => updateCart(() => cartApi.removeItem(id));
    const updateQuantity = (id, size, quantity) => quantity <= 0
        ? removeFromCart(id)
        : updateCart(() => cartApi.updateQuantity(id, { quantity }));

    const completeCheckout = () => {
        // Backend đã xóa giỏ trong transaction tạo đơn, không gửi thêm DELETE.
        setCartItems([]);
        setCartError('');
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            totalItemsCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
            addToCart,
            updateQuantity,
            removeFromCart,
            completeCheckout,
            lastOrder,
            setLastOrder,
            cartLoading,
            cartError,
            syncCartFromBackend,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const CartProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const customerId = !loading && user?.status === 'ACTIVE' && user.role === 'CUSTOMER' ? user.id : null;

    // Đổi tài khoản/đăng xuất sẽ hủy state và request của giỏ cũ ngay lập tức.
    return (
        <CustomerCartProvider key={customerId || 'guest'} customerId={customerId}>
            {children}
        </CustomerCartProvider>
    );
};
