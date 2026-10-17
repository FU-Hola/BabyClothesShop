import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./shared/components/Header/Header";
import MainHeader from "./shared/components/MainHeader/MainHeader";
import CategoryMenu from "./shared/components/CategoryMenu/CategoryMenu";
import Home from "./app/pages/Home/Home";

// Module Cart – Checkout (Công phụ trách: UC10, UC11, UC12)
import { CartProvider } from "./modules/cart-checkout/context/CartContext";
import { cartCheckoutRoutes } from "./modules/cart-checkout/routes";

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
            {/* Trang chủ */}
            <Route path="/" element={<Home />} />

            {/* Quản lý các Route của module Cart - Checkout gom từ folder routes */}
            {cartCheckoutRoutes}
          </Routes>
        </main>
      </div>
    </CartProvider>
  );
};

export default App;
