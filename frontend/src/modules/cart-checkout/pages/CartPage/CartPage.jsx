import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import Stepper from "../../components/Stepper/Stepper";
import styles from "./CartPage.module.css";

// Hàm định dạng tiền tệ VNĐ (ví dụ: 140000 -> 140.000 đ)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    totalItemsCount,
    totalPrice,
    updateQuantity,
    removeFromCart,
    resetDemoCart,
  } = useCart();

  // State thông báo lỗi tồn kho tạm thời (khi bấm tăng quá số lượng cho phép)
  const [stockErrorMap, setStockErrorMap] = useState({});

  // Xử lý tăng số lượng (UC11)
  const handleIncrease = (item) => {
    const res = updateQuantity(item.id, item.size, item.quantity + 1);
    if (!res.success) {
      setStockErrorMap((prev) => ({
        ...prev,
        [`${item.id}-${item.size}`]: res.message,
      }));
    } else {
      // Xóa lỗi nếu tăng thành công
      setStockErrorMap((prev) => {
        const copy = { ...prev };
        delete copy[`${item.id}-${item.size}`];
        return copy;
      });
    }
  };

  // Xử lý giảm số lượng (UC11)
  const handleDecrease = (item) => {
    if (item.quantity === 1) {
      const confirmDelete = window.confirm(
        `Bạn có muốn xóa "${item.name} (Size: ${item.size})" khỏi giỏ hàng?`
      );
      if (confirmDelete) {
        removeFromCart(item.id, item.size);
      }
      return;
    }

    updateQuantity(item.id, item.size, item.quantity - 1);
    // Xóa cảnh báo tồn nếu có
    setStockErrorMap((prev) => {
      const copy = { ...prev };
      delete copy[`${item.id}-${item.size}`];
      return copy;
    });
  };

  // Xóa sản phẩm
  const handleDelete = (item) => {
    const confirmDelete = window.confirm(
      `Xác nhận xóa "${item.name}" khỏi giỏ hàng?`
    );
    if (confirmDelete) {
      removeFromCart(item.id, item.size);
    }
  };

  return (
    <div className={styles.cartPage}>
      {/* 1. Stepper tiến trình (Đang ở bước 1: Giỏ hàng) */}
      <Stepper currentStep={1} />

      <h1 className={styles.pageTitle}>
        <span>Giỏ Hàng Của Bạn</span>
        {cartItems.length > 0 && (
          <span className={styles.itemCountBadge}>
            ({totalItemsCount} sản phẩm)
          </span>
        )}
      </h1>

      {/* TRƯỜNG HỢP 1: GIỎ HÀNG TRỐNG */}
      {cartItems.length === 0 ? (
        <div className={styles.emptyCartState}>
          <ShoppingBag size={64} strokeWidth={1.2} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>Giỏ hàng của bạn đang trống</h2>
          <p className={styles.emptyText}>
            Bạn chưa chọn món đồ nào cho bé. Hãy dạo quanh cửa hàng và chọn những bộ đồ xinh xắn nhé!
          </p>
          <div>
            <Link to="/" className={styles.continueShoppingBtn}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : (
        /* TRƯỜNG HỢP 2: GIỎ HÀNG CÓ SẢN PHẨM */
        <div className="row g-4">
          {/* Cột trái (col-lg-8): Danh sách sản phẩm */}
          <div className="col-lg-8">
            <div className={styles.cartTableCard}>
              {/* Tiêu đề bảng */}
              <div className={styles.tableHeader}>
                <span>Sản phẩm</span>
                <span>Đơn giá</span>
                <span>Số lượng</span>
                <span>Thành tiền</span>
                <span></span>
              </div>

              {/* Danh sách từng món trong giỏ */}
              {cartItems.map((item) => {
                const itemKey = `${item.id}-${item.size}`;
                const isMaxReached = item.quantity >= item.maxStock;
                const errorMsg = stockErrorMap[itemKey];

                return (
                  <div key={itemKey} className={styles.cartItemRow}>
                    {/* Cột 1: Thông tin sản phẩm */}
                    <div className={styles.productInfo}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.productImage}
                      />
                      <div className={styles.productDetails}>
                        <h3 className={styles.productName}>{item.name}</h3>
                        <div className={styles.productMeta}>
                          <span className={styles.sizeBadge}>Size: {item.size}</span>
                          <span>Mã: {item.sku}</span>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Đơn giá */}
                    <div className={styles.unitPrice}>
                      {formatCurrency(item.price)}
                    </div>

                    {/* Cột 3: Bộ tăng giảm số lượng (UC11) */}
                    <div>
                      <div className={styles.quantityControl}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => handleDecrease(item)}
                          aria-label="Giảm số lượng"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="text"
                          readOnly
                          value={item.quantity}
                          className={styles.qtyInput}
                          aria-label="Số lượng hiện tại"
                        />
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          onClick={() => handleIncrease(item)}
                          disabled={isMaxReached}
                          aria-label="Tăng số lượng"
                          title={isMaxReached ? "Đã đạt số lượng tồn tối đa" : "Tăng số lượng"}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Thông báo chạm trần tồn kho (UC11) */}
                      {isMaxReached && (
                        <div className={styles.stockNotice}>
                          <AlertCircle size={12} />
                          <span>Chỉ còn {item.maxStock} sản phẩm khả dụng</span>
                        </div>
                      )}
                      {errorMsg && (
                        <div className="text-danger small mt-1">{errorMsg}</div>
                      )}
                    </div>

                    {/* Cột 4: Thành tiền từng dòng */}
                    <div className={styles.lineTotal}>
                      {formatCurrency(item.price * item.quantity)}
                    </div>

                    {/* Cột 5: Nút xóa */}
                    <div>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item)}
                        aria-label="Xóa sản phẩm này"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Nút quay lại mua hàng */}
            <div className="mt-3 d-flex justify-content-between align-items-center">
              <Link to="/" className="text-decoration-none text-muted small">
                &larr; Tiếp tục chọn thêm sản phẩm khác
              </Link>
              <button
                onClick={resetDemoCart}
                className="btn btn-sm btn-link text-secondary text-decoration-none"
              >
                Đặt lại giỏ hàng mẫu
              </button>
            </div>
          </div>

          {/* Cột phải (col-lg-4): Tóm tắt đơn hàng & Nút Thanh Toán */}
          <div className="col-lg-4">
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>Tóm Tắt Đơn Hàng</h2>

              <div className={styles.summaryRow}>
                <span>Tổng số lượng món:</span>
                <strong>{totalItemsCount} món</strong>
              </div>

              <div className={styles.summaryRow}>
                <span>Tạm tính tiền hàng:</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Phí vận chuyển:</span>
                <span className="text-muted small">Tính tại bước kế tiếp</span>
              </div>

              <div className={styles.summaryDivider}></div>

              <div className={styles.summaryTotalRow}>
                <span className={styles.totalLabel}>Tổng thanh toán:</span>
                <span className={styles.totalValue}>{formatCurrency(totalPrice)}</span>
              </div>
              <div className={styles.vatNotice}>(Đã bao gồm thuế VAT nếu có)</div>

              <button
                type="button"
                className={styles.checkoutBtn}
                onClick={() => navigate("/checkout")}
              >
                <span>Tiến hành thanh toán</span>
                <ArrowRight size={18} />
              </button>

              <div className={styles.trustBadges}>
                <div className={styles.trustItem}>
                  <ShieldCheck size={16} color="#198754" />
                  <span>Cam kết chất lượng vải cotton an toàn cho bé</span>
                </div>
                <div className={styles.trustItem}>
                  <RotateCcw size={16} color="#284e70" />
                  <span>Hỗ trợ đổi size miễn phí trong 7 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
