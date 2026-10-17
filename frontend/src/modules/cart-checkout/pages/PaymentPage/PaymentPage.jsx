import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Copy, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import Stepper from "../../components/Stepper/Stepper";
import styles from "./PaymentPage.module.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const { lastOrder, setLastOrder, clearCart } = useCart();

  // State thông báo đã sao chép STK hoặc nội dung CK
  const [copiedField, setCopiedField] = useState("");

  // State loading khi bấm nút mô phỏng
  const [isProcessing, setIsProcessing] = useState(false);

  // Toggle mô phỏng: Giả lập tình huống hết hàng ở lần kiểm tra tồn kho thứ hai (UC12)
  const [forceStockFailRound2, setForceStockFailRound2] = useState(false);

  // Nếu không có thông tin đơn hàng tạm từ bước Checkout, quay về giỏ hàng
  if (!lastOrder) {
    return (
      <div className={styles.paymentPage}>
        <Stepper currentStep={3} />
        <div className="text-center py-5">
          <h3>Không tìm thấy phiên thanh toán</h3>
          <p className="text-muted">Vui lòng hoàn thành bước nhập thông tin nhận hàng trước.</p>
          <Link to="/checkout" className="btn btn-primary mt-2" style={{ backgroundColor: "#284e70" }}>
            Quay lại thông tin đặt hàng
          </Link>
        </div>
      </div>
    );
  }

  const { orderCode, finalTotal } = lastOrder;

  // Sao chép thông tin vào clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // 1. Khách chọn: "Thanh toán thành công" (UC12)
  const handleSimulateSuccess = () => {
    setIsProcessing(true);

    // Hệ thống kiểm tra số lượng có thể bán LẦN 2 trước khi tạo đơn và giữ hàng
    setTimeout(() => {
      setIsProcessing(false);

      if (forceStockFailRound2) {
        // Tình huống: Hết hàng ở lần kiểm tra cuối -> Không tạo đơn, không giữ hàng
        setLastOrder({
          ...lastOrder,
          outOfStockItemName: lastOrder.items?.[0]?.name || "Sản phẩm",
          outOfStockSize: lastOrder.items?.[0]?.size || "Tiêu chuẩn",
        });
        navigate("/checkout/result?status=out_of_stock");
        return;
      }

      // Đủ hàng -> Tạo đơn thành công: Pending Confirmation, Paid, xóa giỏ hàng
      const completedOrder = {
        ...lastOrder,
        orderStatus: "Chờ xác nhận (Pending Confirmation)",
        paymentStatus: "Đã thanh toán (Theo mô phỏng)",
      };
      setLastOrder(completedOrder);
      clearCart(); // Xóa sản phẩm khỏi giỏ hàng
      navigate("/checkout/result?status=success&method=qr");
    }, 700);
  };

  // 2. Khách chọn: "Thanh toán thất bại" (UC12)
  const handleSimulateFail = () => {
    // Không tạo đơn, không giữ hàng, GIỎ HÀNG GIỮ NGUYÊN
    navigate("/checkout/result?status=failed&method=qr");
  };

  // Tạo URL mã VietQR mô phỏng ngân hàng MB Bank
  const vietQrUrl = `https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${finalTotal}&addInfo=${orderCode}&accountName=BABY%20CLOTHES%20SHOP`;

  return (
    <div className={styles.paymentPage}>
      {/* Stepper tiến trình (Đang ở bước 3: Thanh toán) */}
      <Stepper currentStep={3} />

      {/* CÔNG CỤ HỖ TRỢ KIỂM THỬ: TEST NHÁNH HẾT HÀNG LẦN 2 */}
      <div className="alert alert-light border small mb-4 d-flex justify-content-between align-items-center">
        <span>
          <strong>Công cụ demo giáo viên/sinh viên:</strong> Bật tùy chọn này để giả lập tình huống vừa hết hàng ở lần kiểm tra kho cuối cùng (UC12):
        </span>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleStockFail2"
            checked={forceStockFailRound2}
            onChange={(e) => setForceStockFailRound2(e.target.checked)}
          />
          <label className="form-check-label text-danger fw-bold" htmlFor="toggleStockFail2">
            Giả lập hết hàng lần 2
          </label>
        </div>
      </div>

      <div className={styles.simulatorCard}>
        {/* Header cổng thanh toán */}
        <div className={styles.simHeader}>
          <div className={styles.simBrand}>CỔNG THANH TOÁN NGÂN HÀNG (VIETQR)</div>
          <span className={styles.simBadge}>Môi trường mô phỏng</span>
        </div>

        {/* Khung mã QR */}
        <div className={styles.qrContainer}>
          <div className={styles.qrImageFrame}>
            <img
              src={vietQrUrl}
              alt="Mã QR Chuyển Khoản Ngân Hàng"
              className={styles.qrImage}
              onError={(e) => {
                // Fallback nếu máy tính không có internet để gọi VietQR
                e.target.src = "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + orderCode;
              }}
            />
          </div>
          <p className="fw-bold mb-1" style={{ color: "#284e70" }}>
            Quét mã bằng ứng dụng ngân hàng bất kỳ để thanh toán
          </p>
          <small className="text-muted">
            (Hệ thống tự động điền đúng Số tài khoản, Số tiền và Nội dung chuyển khoản)
          </small>
        </div>

        {/* Bảng thông tin tài khoản thụ hưởng */}
        <table className={styles.bankDetailsTable}>
          <tbody>
            <tr>
              <td className={styles.tableLabel}>Ngân hàng:</td>
              <td className={styles.tableValue}>MB Bank (Ngân hàng Quân Đội)</td>
            </tr>
            <tr>
              <td className={styles.tableLabel}>Số tài khoản:</td>
              <td className={styles.tableValue}>
                <span>0987654321</span>
                <button
                  type="button"
                  onClick={() => handleCopy("0987654321", "stk")}
                  className={styles.copyBadge}
                  title="Sao chép số tài khoản"
                >
                  {copiedField === "stk" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "stk" ? "Đã chép" : "Sao chép"}</span>
                </button>
              </td>
            </tr>
            <tr>
              <td className={styles.tableLabel}>Chủ tài khoản:</td>
              <td className={styles.tableValue}>BABY CLOTHES SHOP</td>
            </tr>
            <tr>
              <td className={styles.tableLabel}>Số tiền cần chuyển:</td>
              <td className={styles.tableValue} style={{ fontSize: "16px", color: "#dc3545" }}>
                {formatCurrency(finalTotal)}
              </td>
            </tr>
            <tr>
              <td className={styles.tableLabel}>Nội dung chuyển khoản:</td>
              <td className={styles.tableValue}>
                <span>{orderCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(orderCode, "code")}
                  className={styles.copyBadge}
                  title="Sao chép nội dung chuyển khoản"
                >
                  {copiedField === "code" ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedField === "code" ? "Đã chép" : "Sao chép"}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* CẢNH BÁO MÔ PHỎNG */}
        <div className="alert alert-warning py-2 px-3 small text-center mb-4">
          <AlertTriangle size={16} className="me-1 inline" />
          <strong>Lưu ý:</strong> Đây là màn hình mô phỏng đồ án môn học. Vui lòng chọn 1 trong 2 nút bên dưới để thử nghiệm kết quả:
        </div>

        {/* 2 NÚT MÔ PHỎNG THEO USE CASE UC12 */}
        <div className={styles.simActions}>
          <button
            type="button"
            className={styles.successBtn}
            onClick={handleSimulateSuccess}
            disabled={isProcessing}
          >
            <CheckCircle2 size={18} />
            <span>{isProcessing ? "Đang xác thực tồn kho..." : "Thanh toán thành công"}</span>
          </button>

          <button
            type="button"
            className={styles.failBtn}
            onClick={handleSimulateFail}
            disabled={isProcessing}
          >
            <XCircle size={18} />
            <span>Thanh toán thất bại</span>
          </button>
        </div>

        <Link to="/checkout" className={styles.cancelLink}>
          <ArrowLeft size={14} className="me-1 inline" />
          Quay lại màn hình thông tin nhận hàng
        </Link>
      </div>
    </div>
  );
};

export default PaymentPage;
