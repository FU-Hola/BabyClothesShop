import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Banknote,
  QrCode,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import Stepper from "../../components/Stepper/Stepper";
import styles from "./CheckoutPage.module.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const SHIPPING_FEE = 30000; // Phí giao hàng cố định 30.000 đ

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart, setLastOrder } = useCart();

  // 1. Quản lý 4 trường thông tin người nhận theo đúng UC12
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
  });

  // 2. Phương thức thanh toán (bắt buộc chọn 1 trong 2: 'cash' hoặc 'qr')
  const [paymentMethod, setPaymentMethod] = useState("");

  // 3. Quản lý lỗi validate form
  const [errors, setErrors] = useState({});

  // 4. Quản lý lỗi tồn kho (Check tồn kho lần 1 - UC12)
  const [stockIssue, setStockIssue] = useState(null);

  // 5. Trạng thái nút bấm đang loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle mô phỏng để dễ dàng test nhánh "thiếu hàng khi bấm thanh toán"
  const [forceStockFail, setForceStockFail] = useState(false);

  // Nếu giỏ hàng trống, chuyển hướng về trang giỏ hàng
  if (cartItems.length === 0) {
    return (
      <div className={styles.checkoutPage}>
        <Stepper currentStep={2} />
        <div className="text-center py-5">
          <h3>Giỏ hàng của bạn đang trống!</h3>
          <p className="text-muted">Vui lòng chọn sản phẩm vào giỏ trước khi thanh toán.</p>
          <Link to="/cart" className="btn btn-primary mt-2" style={{ backgroundColor: "#284e70" }}>
            Quay lại giỏ hàng
          </Link>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Xóa lỗi của trường đó khi người dùng bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Hàm kiểm tra hợp lệ dữ liệu (Validate)
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên người nhận";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại người nhận";
    } else if (!/(0[3|5|7|8|9])+([0-9]{8})\b/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ (cần 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09)";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ nhận hàng chi tiết";
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = "Vui lòng chọn 1 phương thức thanh toán (Tiền mặt hoặc Quét QR)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý khi nhấn nút Đặt hàng / Thanh toán (UC12)
  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Kiểm tra validate form
    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: "smooth" });
      return;
    }

    setIsSubmitting(true);
    setStockIssue(null);

    // 2. Mô phỏng hệ thống kiểm tra số lượng có thể bán (LẦN 1 - UC12)
    setTimeout(() => {
      setIsSubmitting(false);

      // Nếu bật nút mô phỏng thiếu hàng HOẶC trong giỏ có món vượt tồn kho thật
      const outOfStockItem = cartItems.find((item) => item.quantity > item.maxStock);

      if (forceStockFail || outOfStockItem) {
        const itemFailed = outOfStockItem || cartItems[0];
        setStockIssue({
          name: itemFailed.name,
          size: itemFailed.size,
          requested: itemFailed.quantity,
          available: Math.max(1, itemFailed.maxStock - 1),
        });
        window.scrollTo({ top: 80, behavior: "smooth" });
        return;
      }

      // 3. Nếu đủ hàng: Phân nhánh theo phương thức thanh toán đã chọn
      const orderCode = "BCS-" + Math.floor(100000 + Math.random() * 900000);
      const finalTotal = totalPrice + SHIPPING_FEE;

      const orderData = {
        orderCode,
        createdAt: new Date().toLocaleString("vi-VN"),
        customer: formData,
        items: cartItems,
        subTotal: totalPrice,
        shippingFee: SHIPPING_FEE,
        finalTotal,
        paymentMethod, // 'cash' hoặc 'qr'
      };

      if (paymentMethod === "cash") {
        // Nhánh TIỀN MẶT: Tạo đơn luôn -> Pending Confirmation, Chưa thanh toán -> Xóa giỏ -> Màn 4
        orderData.orderStatus = "Chờ xác nhận (Pending Confirmation)";
        orderData.paymentStatus = "Thanh toán khi nhận hàng (Chưa thanh toán)";
        setLastOrder(orderData);
        clearCart();
        navigate("/checkout/result?status=success&method=cash");
      } else if (paymentMethod === "qr") {
        // Nhánh QUÉT QR: Chuyển sang Màn 3 (Thanh toán mô phỏng), CHƯA tạo đơn, CHƯA xóa giỏ
        setLastOrder(orderData);
        navigate("/checkout/payment");
      }
    }, 600);
  };

  return (
    <div className={styles.checkoutPage}>
      {/* Stepper tiến trình (Đang ở bước 2: Thông tin nhận hàng) */}
      <Stepper currentStep={2} />

      <h1 className={styles.pageTitle}>Thông Tin Đặt Hàng & Thanh Toán</h1>

      {/* CẢNH BÁO THIẾU HÀNG KHI KIỂM TRA TỒN KHO LẦN 1 (UC12) */}
      {stockIssue && (
        <div className={styles.stockAlertBanner} role="alert">
          <div className="d-flex align-items-center gap-2 mb-2">
            <AlertTriangle size={20} color="#dc3545" />
            <strong className="fs-6">Rất tiếc! Số lượng hàng không đủ đáp ứng</strong>
          </div>
          <p className="mb-2">
            Sản phẩm <strong>"{stockIssue.name} (Size: {stockIssue.size})"</strong> bạn yêu cầu{" "}
            <strong>{stockIssue.requested} món</strong>, nhưng hiện tại trong kho chỉ còn{" "}
            <strong className="text-danger">{stockIssue.available} món</strong> khả dụng.
          </p>
          <div className="d-flex gap-3 align-items-center mt-3">
            <Link to="/cart" className="btn btn-sm btn-danger">
              Quay lại giỏ hàng để cập nhật số lượng
            </Link>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setStockIssue(null)}
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* CỘT TRÁI (col-lg-7): 4 TRƯỜNG THÔNG TIN + PHƯƠNG THỨC THANH TOÁN */}
          <div className="col-lg-7">
            {/* 1. Form thông tin người nhận (Đúng 4 trường theo UC) */}
            <div className={styles.formCard}>
              <h2 className={styles.cardHeading}>
                <User size={18} />
                <span>1. Thông tin người nhận hàng</span>
              </h2>

              {/* Trường 1: Họ tên */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="fullName">
                  Họ và tên người nhận <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Thị Hoa"
                  className={`${styles.textInput} ${errors.fullName ? styles.inputError : ""}`}
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && <div className={styles.errorText}>{errors.fullName}</div>}
              </div>

              {/* Trường 2: Số điện thoại */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="phone">
                  Số điện thoại nhận hàng <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ví dụ: 0912345678"
                  className={`${styles.textInput} ${errors.phone ? styles.inputError : ""}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <div className={styles.errorText}>{errors.phone}</div>}
              </div>

              {/* Trường 3: Địa chỉ nhận hàng */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="address">
                  Địa chỉ giao hàng chi tiết <span className={styles.requiredMark}>*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Số nhà, tên ngõ, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                  className={`${styles.textInput} ${errors.address ? styles.inputError : ""}`}
                  value={formData.address}
                  onChange={handleInputChange}
                />
                {errors.address && <div className={styles.errorText}>{errors.address}</div>}
              </div>

              {/* Trường 4: Ghi chú đơn hàng */}
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel} htmlFor="note">
                  Ghi chú đơn hàng (không bắt buộc)
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi giao 15 phút..."
                  className={styles.textArea}
                  value={formData.note}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* 2. Chọn phương thức thanh toán (Radio Card: Tiền mặt hoặc Quét QR) */}
            <div className={styles.formCard}>
              <h2 className={styles.cardHeading}>
                <Banknote size={18} />
                <span>2. Chọn phương thức thanh toán</span>
              </h2>

              {errors.paymentMethod && (
                <div className="alert alert-danger py-2 small mb-3">
                  {errors.paymentMethod}
                </div>
              )}

              <div className={styles.paymentOptionGroup}>
                {/* Lựa chọn 1: Tiền mặt (COD) */}
                <label
                  className={`${styles.paymentOptionCard} ${paymentMethod === "cash" ? styles.paymentOptionCardSelected : ""
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                    }}
                    className={styles.radioInput}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <Banknote size={20} color="#284e70" />
                      <h3 className={styles.optionTitle}>Thanh toán tiền mặt</h3>
                    </div>
                    <p className={styles.optionDesc}>
                      Khách hàng thanh toán tiền mặt trực tiếp cho nhân viên giao hàng khi nhận kiện hàng (COD).
                    </p>
                  </div>
                </label>

                {/* Lựa chọn 2: Quét mã QR chuyển khoản */}
                <label
                  className={`${styles.paymentOptionCard} ${paymentMethod === "qr" ? styles.paymentOptionCardSelected : ""
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                    }}
                    className={styles.radioInput}
                  />
                  <div className={styles.optionContent}>
                    <div className={styles.optionHeader}>
                      <QrCode size={20} color="#284e70" />
                      <h3 className={styles.optionTitle}>Quét mã QR chuyển khoản</h3>
                    </div>
                    <p className={styles.optionDesc}>
                      Mã QR ngân hàng sẽ hiển thị ở bước tiếp theo để bạn quét và hoàn tất thanh toán tức thời.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI (col-lg-5): TÓM TẮT ĐƠN HÀNG RÚT GỌN */}
          <div className="col-lg-5">
            <div className={styles.orderSummaryBox}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h2 className="fs-5 fw-bold m-0" style={{ color: "#284e70" }}>
                  Đơn Hàng ({cartItems.length} món)
                </h2>
                <Link to="/cart" className="text-decoration-none small" style={{ color: "#284e70" }}>
                  Chỉnh sửa
                </Link>
              </div>

              {/* Danh sách món rút gọn */}
              <div className={styles.orderItemsList}>
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className={styles.orderItemMini}>
                    <img src={item.image} alt={item.name} className={styles.orderItemThumb} />
                    <div className={styles.orderItemInfo}>
                      <p className={styles.orderItemName}>{item.name}</p>
                      <span className="text-muted small">
                        Size: {item.size} &times; {item.quantity}
                      </span>
                    </div>
                    <div className={styles.orderItemPrice}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng tính chi phí */}
              <div className="border-top pt-3">
                <div className="d-flex justify-content-between mb-2 small text-secondary">
                  <span>Tạm tính tiền hàng:</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 small text-secondary">
                  <span>Phí vận chuyển tiêu chuẩn:</span>
                  <span>{formatCurrency(SHIPPING_FEE)}</span>
                </div>
                <div className="d-flex justify-content-between align-items-baseline pt-2 border-top">
                  <span className="fw-bold" style={{ color: "#284e70" }}>
                    Tổng cộng:
                  </span>
                  <span className="fs-4 fw-bold" style={{ color: "#284e70" }}>
                    {formatCurrency(totalPrice + SHIPPING_FEE)}
                  </span>
                </div>
              </div>

              {/* Nút hành động chính đổi nhãn linh hoạt theo phương thức đã chọn */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span>Đang kiểm tra tồn kho...</span>
                ) : paymentMethod === "qr" ? (
                  <>
                    <span>Tiến hành quét mã QR</span>
                    <ArrowRight size={18} />
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    <span>Đặt hàng (Tiền mặt)</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link to="/cart" className={styles.backToCartLink}>
                  <ArrowLeft size={16} />
                  <span>Quay lại giỏ hàng</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
