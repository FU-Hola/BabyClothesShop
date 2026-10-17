import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./shared/components/Header/Header";
import MainHeader from "./shared/components/MainHeader/MainHeader";
import CategoryMenu from "./shared/components/CategoryMenu/CategoryMenu";
import Home from "./app/pages/Home/Home";

// Module Cart – Checkout (Công phụ trách: UC10, UC11, UC12)
import { CartProvider } from "./modules/cart-checkout/context/CartContext";
import CartPage from "./modules/cart-checkout/pages/CartPage/CartPage";
import CheckoutPage from "./modules/cart-checkout/pages/CheckoutPage/CheckoutPage";
import PaymentPage from "./modules/cart-checkout/pages/PaymentPage/PaymentPage";
import OrderResultPage from "./modules/cart-checkout/pages/OrderResultPage/OrderResultPage";

const App = () => {
  return (
    <CartProvider>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#fdfdfd" }}>
        {/* Thanh Header trên cùng */}
        <Header />

        {/* Header chính có Tìm kiếm, Logo và Giỏ hàng */}
        <MainHeader />

        {/* Thanh Menu danh mục */}
        <CategoryMenu />

        {/* Nội dung chính điều hướng theo đường dẫn URL */}
        <main style={{ flex: 1, padding: "20px 0" }}>
          <Routes>
            {/* Trang chủ với demo sản phẩm và Add to Cart (UC10) */}
            <Route path="/" element={<Home />} />

            {/* Màn 1: Giỏ hàng & Tăng giảm số lượng (UC10, UC11) */}
            <Route path="/cart" element={<CartPage />} />

            {/* Màn 2: Checkout nhập thông tin người nhận & chọn phương thức (UC12) */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Màn 3: Thanh toán mô phỏng Quét mã QR (UC12) */}
            <Route path="/checkout/payment" element={<PaymentPage />} />

            {/* Màn 4: Kết quả đặt hàng (UC12) */}
            <Route path="/checkout/result" element={<OrderResultPage />} />
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
};

export default App;
