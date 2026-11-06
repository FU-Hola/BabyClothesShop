import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import cartApi from "../api/cartApi";

const CartContext = createContext();

const INITIAL_CART = [
  {
    id: 1,
    name: "Body Chip Cotton Sơ Sinh Cổ Tròn",
    size: "3-6M",
    price: 140000,
    quantity: 2,
    maxStock: 3,
    image: "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&auto=format&fit=crop&q=80",
    sku: "BC-COTTON-01"
  },
  {
    id: 2,
    name: "Váy Xòe Công Chúa Họa Tiết Hoa Nhí",
    size: "2-3Y",
    price: 180000,
    quantity: 1,
    maxStock: 5,
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=300&auto=format&fit=crop&q=80",
    sku: "VX-HOA-02"
  }
];

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("baby_cart_items");
      return saved ? JSON.parse(saved) : INITIAL_CART;
    } catch {
      return INITIAL_CART;
    }
  });

  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("baby_last_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [backendSync, setBackendSync] = useState(false);

  // Thử đồng bộ giỏ hàng từ Backend Spring Boot nếu server đang bật
  const syncCartFromBackend = useCallback(async () => {
    try {
      const res = await cartApi.getCart();
      if (res && res.data && Array.isArray(res.data.items)) {
        if (res.data.items.length > 0) {
          const mappedItems = res.data.items.map((i) => ({
            id: i.id,
            variantId: i.variantId,
            productId: i.productId,
            name: i.productName,
            size: i.size,
            color: i.color,
            price: i.price,
            quantity: i.quantity,
            maxStock: i.availableStock,
            image: i.imageUrl || "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300&auto=format&fit=crop&q=80",
            sku: i.sku,
          }));
          setCartItems(mappedItems);
        }
        setBackendSync(true);
      }
    } catch {
      // Backend chưa chạy hoặc offline -> dùng dữ liệu localStorage
      setBackendSync(false);
    }
  }, []);

  useEffect(() => {
    syncCartFromBackend();
  }, [syncCartFromBackend]);

  useEffect(() => {
    localStorage.setItem("baby_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (lastOrder) {
      localStorage.setItem("baby_last_order", JSON.stringify(lastOrder));
    }
  }, [lastOrder]);

  // UC10: Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, size, quantityToAdd = 1) => {
    // 1. Thử gọi API Backend nếu có variantId
    if (product.variantId) {
      try {
        const res = await cartApi.addToCart({
          variantId: product.variantId,
          quantity: quantityToAdd,
        });
        if (res?.data?.items) {
          syncCartFromBackend();
          return { success: true, message: "Đã thêm vào giỏ hàng thành công!" };
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        return { success: false, message: msg || "Không thể thêm vào giỏ hàng" };
      }
    }

    // 2. Fallback xử lý local state
    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      const existingItem = cartItems[existingIndex];
      const newQty = existingItem.quantity + quantityToAdd;

      if (existingItem.maxStock && newQty > existingItem.maxStock) {
        return {
          success: false,
          message: `Bạn đã có ${existingItem.quantity} sản phẩm trong giỏ. Chỉ có thể thêm tối đa ${existingItem.maxStock - existingItem.quantity} món nữa!`,
        };
      }

      const updated = [...cartItems];
      updated[existingIndex] = { ...existingItem, quantity: newQty };
      setCartItems(updated);
      return { success: true, message: "Đã cập nhật số lượng trong giỏ hàng!" };
    } else {
      const newItem = {
        id: product.id,
        variantId: product.variantId,
        name: product.name,
        size: size,
        price: product.price,
        quantity: quantityToAdd,
        maxStock: product.maxStock || 10,
        image: product.image,
        sku: product.sku || `SP-${product.id}`,
      };
      setCartItems([...cartItems, newItem]);
      return { success: true, message: "Đã thêm vào giỏ hàng thành công!" };
    }
  };

  // UC11: Cập nhật số lượng trong giỏ hàng
  const updateQuantity = async (id, size, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, size);
      return { success: true };
    }

    const item = cartItems.find((i) => i.id === id && (size ? i.size === size : true));
    if (!item) return { success: false, message: "Sản phẩm không tồn tại" };

    // Thử gọi Backend API nếu item có id dạng UUID
    if (typeof id === "string" && id.length > 20) {
      try {
        await cartApi.updateQuantity(id, { quantity: newQty });
        syncCartFromBackend();
        return { success: true };
      } catch (err) {
        const msg = err.response?.data?.message || "Số lượng yêu cầu vượt quá tồn kho khả dụng";
        return { success: false, message: msg };
      }
    }

    if (item.maxStock && newQty > item.maxStock) {
      return {
        success: false,
        message: `Số lượng yêu cầu vượt quá tồn kho khả dụng (tối đa ${item.maxStock} sản phẩm).`,
      };
    }

    setCartItems(
      cartItems.map((i) =>
        i.id === id && (size ? i.size === size : true) ? { ...i, quantity: newQty } : i
      )
    );
    return { success: true };
  };

  // Xóa một món khỏi giỏ hàng
  const removeFromCart = async (id, size) => {
    if (typeof id === "string" && id.length > 20) {
      try {
        await cartApi.removeItem(id);
        syncCartFromBackend();
      } catch {
        // Fallback xóa local
      }
    }
    setCartItems(cartItems.filter((i) => !(i.id === id && (size ? i.size === size : true))));
  };

  // Xóa sạch giỏ hàng (sau khi đặt hàng thành công)
  const clearCart = async () => {
    try {
      await cartApi.clearCart();
    } catch {
      // ignore
    }
    setCartItems([]);
    localStorage.removeItem("baby_cart_items");
  };

  // Khôi phục lại dữ liệu mẫu ban đầu (phục vụ lúc test)
  const resetDemoCart = () => {
    setCartItems(INITIAL_CART);
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItemsCount,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resetDemoCart,
        lastOrder,
        setLastOrder,
        backendSync,
        syncCartFromBackend,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được sử dụng bên trong CartProvider");
  }
  return context;
};
