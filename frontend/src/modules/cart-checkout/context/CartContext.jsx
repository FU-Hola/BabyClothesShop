import React, { createContext, useContext, useState, useEffect } from "react";

// Tạo Context cho Giỏ hàng để các trang dễ dàng sử dụng chung dữ liệu
const CartContext = createContext();

// Dữ liệu mẫu ban đầu để bạn dễ dàng chạy thử và kiểm tra ngay lập tức
const INITIAL_CART = [
  {
    id: 1,
    name: "Body Chip Cotton Sơ Sinh Cổ Tròn",
    size: "3-6M",
    price: 140000,
    quantity: 2,
    maxStock: 3, // Tồn kho tối đa để kiểm tra logic vượt quá số lượng (UC11)
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
  // 1. Quản lý danh sách sản phẩm trong giỏ (lưu vào localStorage)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem("baby_cart_items");
      return saved ? JSON.parse(saved) : INITIAL_CART;
    } catch {
      return INITIAL_CART;
    }
  });

  // 2. Lưu thông tin đơn hàng vừa đặt thành công/thất bại (cho Màn 4)
  const [lastOrder, setLastOrder] = useState(() => {
    try {
      const saved = localStorage.getItem("baby_last_order");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tự động đồng bộ dữ liệu vào localStorage mỗi khi giỏ hàng thay đổi
  useEffect(() => {
    localStorage.setItem("baby_cart_items", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (lastOrder) {
      localStorage.setItem("baby_last_order", JSON.stringify(lastOrder));
    }
  }, [lastOrder]);

  // UC10: Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, size, quantityToAdd = 1) => {
    // Tìm xem đã có sản phẩm cùng mã và cùng Size trong giỏ chưa
    const existingIndex = cartItems.findIndex(
      (item) => item.id === product.id && item.size === size
    );

    if (existingIndex > -1) {
      // Đã có -> cộng thêm số lượng nhưng không vượt maxStock
      const existingItem = cartItems[existingIndex];
      const newQty = existingItem.quantity + quantityToAdd;

      if (newQty > existingItem.maxStock) {
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
      // Chưa có -> thêm mới vào giỏ
      const newItem = {
        id: product.id,
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

  // UC11: Cập nhật số lượng (tăng/giảm) trong giỏ hàng
  const updateQuantity = (id, size, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id, size);
      return { success: true };
    }

    const item = cartItems.find((i) => i.id === id && i.size === size);
    if (!item) return { success: false, message: "Sản phẩm không tồn tại" };

    if (newQty > item.maxStock) {
      return {
        success: false,
        message: `Số lượng yêu cầu vượt quá tồn kho khả dụng (tối đa ${item.maxStock} sản phẩm).`,
      };
    }

    setCartItems(
      cartItems.map((i) =>
        i.id === id && i.size === size ? { ...i, quantity: newQty } : i
      )
    );
    return { success: true };
  };

  // Xóa một món khỏi giỏ hàng
  const removeFromCart = (id, size) => {
    setCartItems(cartItems.filter((i) => !(i.id === id && i.size === size)));
  };

  // Xóa sạch giỏ hàng (sau khi đặt hàng thành công)
  const clearCart = () => {
    setCartItems([]);
  };

  // Khôi phục lại dữ liệu mẫu ban đầu (phục vụ lúc test)
  const resetDemoCart = () => {
    setCartItems(INITIAL_CART);
  };

  // Tổng số lượng món hàng
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Tổng tiền hàng
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook tùy chỉnh giúp các component dùng Cart dễ dàng hơn
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart phải được sử dụng bên trong CartProvider");
  }
  return context;
};
