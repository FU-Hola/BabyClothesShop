import React from "react";
import { Route } from "react-router-dom";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import PaymentPage from "../pages/PaymentPage/PaymentPage";
import OrderResultPage from "../pages/OrderResultPage/OrderResultPage";

/**
 * QUẢN LÝ ROUTE MODULE CART - CHECKOUT (UC10, UC11, UC12)
 * Người phụ trách: Công
 *
 * Danh sách các trang:
 * 1. /cart             -> Màn 1: Giỏ hàng (UC10, UC11)
 * 2. /checkout         -> Màn 2: Đặt hàng - Nhập thông tin & chọn phương thức (UC12)
 * 3. /checkout/payment -> Màn 3: Thanh toán mô phỏng Quét mã QR (UC12)
 * 4. /checkout/result  -> Màn 4: Kết quả đặt hàng (UC12)
 */

// Dạng JSX Fragment chứa các thẻ <Route> để đưa vào <Routes> trong App.jsx
export const cartCheckoutRoutes = (
  <React.Fragment>
    {/* Màn 1: Giỏ hàng */}
    <Route path="/cart" element={<CartPage />} />

    {/* Màn 2: Thông tin nhận hàng & phương thức thanh toán */}
    <Route path="/checkout" element={<CheckoutPage />} />

    {/* Màn 3: Thanh toán mô phỏng mã QR */}
    <Route path="/checkout/payment" element={<PaymentPage />} />

    {/* Màn 4: Kết quả đặt hàng */}
    <Route path="/checkout/result" element={<OrderResultPage />} />
  </React.Fragment>
);

// Dạng mảng cấu hình (cho bạn nào thích map qua danh sách)
export const cartCheckoutRouteList = [
  { path: "/cart", element: <CartPage />, name: "Giỏ hàng" },
  { path: "/checkout", element: <CheckoutPage />, name: "Thông tin nhận hàng" },
  { path: "/checkout/payment", element: <PaymentPage />, name: "Thanh toán mô phỏng" },
  { path: "/checkout/result", element: <OrderResultPage />, name: "Kết quả đặt hàng" },
];

export default cartCheckoutRoutes;
