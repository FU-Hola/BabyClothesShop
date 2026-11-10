import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Copy, Check } from "lucide-react";
import { useCart } from "../../hooks/useCart.js";
import Stepper from "../../components/Stepper/Stepper";
import checkoutApi from "../../api/checkoutApi";
import styles from "./PaymentPage.module.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedKey = searchParams.get("checkout");
  const processing = useRef(false);
  const { lastOrder, setLastOrder, completeCheckout, syncCartFromBackend } = useCart();

  // State thông báo đã sao chép STK hoặc nội dung CK
  const [copiedField, setCopiedField] = useState("");

  // State loading khi bấm nút mô phỏng
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [verified, setVerified] = useState(null);
  const checkoutKey = requestedKey || lastOrder?.checkoutKey;
  useEffect(() => {
    if (!checkoutKey) return;
    let active = true;
    checkoutApi.detail(checkoutKey).then((response) => {
      if (!active) return;
      if (!response?.success || !response.data) throw new Error('Không tải được phiên thanh toán.');
      setVerified({ key: checkoutKey, data: response.data, receivedAt: Date.now() });
    }).catch((error) => {
      if (active) setVerified({ key: checkoutKey, error: error.response?.data?.message || error.message });
    });
    return () => { active = false; };
  }, [checkoutKey]);

  // Countdown is informational; the backend checks expiry under the order lock.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const current = verified?.key === checkoutKey ? verified.data : null;
  const remaining = current?.paymentExpiresAt
    ? Math.max(0, Math.ceil((Date.parse(current.paymentExpiresAt) - (current.serverTime ? Date.parse(current.serverTime) + now - verified.receivedAt : now)) / 1000)) : 0;
  if (checkoutKey && (!verified || verified.key !== checkoutKey)) {
    return <div className={styles.paymentPage} role="status">Đang kiểm tra phiên thanh toán...</div>;
  }
  if (verified?.key === checkoutKey && verified.error) {
    return <div className={styles.paymentPage}><p role="alert">{verified.error}</p><Link to="/don-hang">Xem đơn hàng của tôi</Link></div>;
  }
  if (current && current.orderStatus !== 'PENDING_PAYMENT') {
    return <div className={styles.paymentPage}>
      <p role="status">{current.paymentStatus === 'PAID' ? 'Phiên này đã thanh toán thành công.' : 'Phiên thanh toán đã kết thúc; hàng đã được giải phóng.'}</p>
      <Link to={`/don-hang/${current.orderId}`}>Xem chi tiết đơn hàng</Link>
      <Link to="/cart" className="d-block" onClick={() => { setLastOrder(null); syncCartFromBackend(); }}>Quay lại giỏ hàng</Link>
    </div>;
  }

  // Nếu không có thông tin đơn hàng tạm từ bước Checkout, quay về giỏ hàng
  if (!current?.checkoutKey) {
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

  const finalTotal = Number(current.totalAmount);
  const orderCode = current.orderCode;

  // Sao chép thông tin vào clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  // 1. Khách chọn: "Thanh toán thành công" (UC12)
  const handleSimulateSuccess = async () => {
    if (processing.current) return;
    processing.current = true;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const response = await checkoutApi.simulatePayment({
        checkoutKey: current.checkoutKey,
        isSuccess: true,
      });
      const created = response?.data;
      if (!response?.success || created?.success !== true || !created.orderId || !created.orderCode) {
        throw new Error(created?.message || response?.message || 'Chưa xác nhận được đơn hàng.');
      }
      setLastOrder(null);
      await completeCheckout();
      navigate('/checkout/result?status=success&order=' + encodeURIComponent(created.orderId));
    } catch (error) {
      setPaymentError(error.response?.data?.message || error.message || 'Không thể xác nhận thanh toán. Vui lòng thử lại.');
      const latest = await checkoutApi.detail(current.checkoutKey).catch(() => null);
      if (latest?.data) setVerified({ key: current.checkoutKey, data: latest.data, receivedAt: Date.now() });
    } finally {
      processing.current = false;
      setIsProcessing(false);
    }
  };

  const handleSimulateFail = async () => {
    if (processing.current) return;
    processing.current = true;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const response = await checkoutApi.simulatePayment({ checkoutKey: current.checkoutKey, isSuccess: false });
      if (response?.success && response.data?.success === true) {
        setLastOrder(null);
        await completeCheckout();
        navigate('/checkout/result?status=success&order=' + encodeURIComponent(response.data.orderId));
        return;
      }
      if (!response?.success || response.data?.success !== false) {
        throw new Error('Không xác nhận được kết quả thanh toán.');
      }
      setLastOrder(null);
      await syncCartFromBackend();
      navigate('/checkout/result?status=failed');
    } catch (error) {
      setPaymentError(error.response?.data?.message || error.message || 'Không thể kết nối máy chủ.');
    } finally {
      processing.current = false;
      setIsProcessing(false);
    }
  };

  const cancelCheckout = async () => {
    if (processing.current) return;
    processing.current = true;
    setIsProcessing(true);
    setPaymentError('');
    try {
      const response = await checkoutApi.cancel(current.checkoutKey);
      if (!response?.success) throw new Error('Không hủy được phiên thanh toán.');
      setLastOrder(null);
      await syncCartFromBackend();
      navigate('/cart');
    } catch (error) {
      setPaymentError(error.response?.data?.message || error.message);
    } finally {
      processing.current = false;
      setIsProcessing(false);
    }
  };

  // Tạo URL mã VietQR mô phỏng ngân hàng MB Bank
  const vietQrUrl = `https://img.vietqr.io/image/970422-0987654321-compact2.png?amount=${finalTotal}&addInfo=${orderCode}&accountName=BABY%20CLOTHES%20SHOP`;

  return (
    <div className={styles.paymentPage}>
      {/* Stepper tiến trình (Đang ở bước 3: Thanh toán) */}
      <Stepper currentStep={3} />

      <div className="alert alert-info" role="status">
        {remaining > 0 ? `Hàng được giữ cho đơn này trong ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')} nữa.`
          : 'Đã hết hạn thanh toán. Hãy kiểm tra trạng thái đơn trước khi tạo phiên mới.'}
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
        {paymentError && <div className="alert alert-danger" role="alert">{paymentError}</div>}
        <div className={styles.simActions}>
          <button
            type="button"
            className={styles.successBtn}
            onClick={handleSimulateSuccess}
            disabled={isProcessing || remaining === 0}
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

        <button type="button" className={styles.cancelLink} disabled={isProcessing} onClick={cancelCheckout}>
          <ArrowLeft size={14} className="me-1 inline" /> Hủy phiên và quay lại giỏ hàng
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
