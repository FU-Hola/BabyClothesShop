import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  RotateCcw,
  ArrowRight,
  Home,
  FileCheck,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import Stepper from "../../components/Stepper/Stepper";
import styles from "./OrderResultPage.module.css";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const OrderResultPage = () => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "success";
  const method = searchParams.get("method") || "cash";

  const { lastOrder } = useCart();

  // ----------------------------------------------------
  // BIẾN THỂ 2: THANH TOÁN THẤT BẠI (Mô phỏng QR thất bại)
  // ----------------------------------------------------
  if (status === "failed") {
    return (
      <div className={styles.resultPage}>
        <Stepper currentStep={3} />
        <div className={styles.resultCard}>
          <div className={styles.statusHeader}>
            <XCircle size={64} strokeWidth={1.5} className={styles.statusIconFailed} />
            <h1 className={styles.statusTitle} style={{ color: "#dc3545" }}>
              Thanh Toán Không Thành Công
            </h1>
            <p className={styles.statusSubtitle}>
              Giao dịch thanh toán mô phỏng chưa hoàn tất hoặc đã bị hủy. Đơn hàng của bạn{" "}
              <strong>CHƯA</strong> được tạo và giỏ hàng của bạn vẫn được giữ nguyên vẹn.
            </p>
          </div>

          <div className="alert alert-light border text-center p-3 mb-4">
            <p className="mb-1 text-muted small">
              Bạn có thể quét lại mã QR để thanh toán hoặc quay về giỏ hàng để chọn hình thức thanh toán tiền mặt.
            </p>
          </div>

          <div className={styles.actionButtonGroup}>
            <Link to="/checkout/payment" className={styles.btnPrimary}>
              <RotateCcw size={16} />
              <span>Thử lại thanh toán</span>
            </Link>
            <Link to="/cart" className={styles.btnSecondary}>
              <ShoppingBag size={16} />
              <span>Quay lại giỏ hàng</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // BIẾN THỂ 3: HẾT HÀNG Ở LẦN KIỂM TRA CUỐI (UC12)
  // ----------------------------------------------------
  if (status === "out_of_stock") {
    return (
      <div className={styles.resultPage}>
        <Stepper currentStep={3} />
        <div className={styles.resultCard}>
          <div className={styles.statusHeader}>
            <AlertTriangle size={64} strokeWidth={1.5} className={styles.statusIconWarning} />
            <h1 className={styles.statusTitle} style={{ color: "#d97706" }}>
              Rất Tiếc, Sản Phẩm Vừa Hết Hàng!
            </h1>
            <p className={styles.statusSubtitle}>
              Trong quá trình bạn hoàn tất thanh toán, sản phẩm{" "}
              <strong>"{lastOrder?.outOfStockItemName || "Quần áo trẻ em"}"</strong> đã được khách hàng khác đặt mua hết số lượng khả dụng.
            </p>
          </div>

          <div className="alert alert-warning p-3 mb-4">
            <h6 className="fw-bold mb-1">Quy định xử lý hệ thống:</h6>
            <p className="small mb-0">
              Hệ thống đã tự động hủy lượt đặt này, <strong>KHÔNG</strong> tạo đơn và{" "}
              <strong>KHÔNG</strong> trừ tiền của quý khách. Xin quý khách vui lòng quay lại giỏ hàng để chọn sản phẩm/size thay thế.
            </p>
          </div>

          <div className={styles.actionButtonGroup}>
            <Link to="/cart" className={styles.btnPrimary}>
              <ShoppingBag size={16} />
              <span>Quay lại giỏ hàng để điều chỉnh</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // BIẾN THỂ 1: ĐẶT HÀNG THÀNH CÔNG (Tiền mặt hoặc QR)
  // ----------------------------------------------------
  return (
    <div className={styles.resultPage}>
      {/* Stepper tiến trình (Đang ở bước 4: Hoàn tất đơn) */}
      <Stepper currentStep={4} />

      <div className={styles.resultCard}>
        {/* Header thành công */}
        <div className={styles.statusHeader}>
          <CheckCircle2 size={64} strokeWidth={1.5} className={styles.statusIconSuccess} />
          <h1 className={styles.statusTitle} style={{ color: "#198754" }}>
            Đặt Hàng Thành Công!
          </h1>
          <p className={styles.statusSubtitle}>
            Cảm ơn bạn đã tin tưởng mua sắm tại <strong>BaBy Clothes Shop</strong>. Đơn hàng của bạn đã được tiếp nhận và nhân viên sẽ xử lý ngay.
          </p>
        </div>

        {/* Thông tin đơn hàng (Mã đơn, Ngày, Trạng thái) */}
        <div className={styles.orderMetaGrid}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Mã đơn hàng:</span>
            <span className={styles.metaValue} style={{ fontSize: "16px" }}>
              #{lastOrder?.orderCode || "BCS-849204"}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Thời gian đặt:</span>
            <span className={styles.metaValue}>
              {lastOrder?.createdAt || new Date().toLocaleString("vi-VN")}
            </span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Trạng thái đơn hàng:</span>
            <div>
              <span className={styles.badgePending}>
                {lastOrder?.orderStatus || "Chờ xác nhận (Pending Confirmation)"}
              </span>
            </div>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Trạng thái thanh toán:</span>
            <div>
              {method === "qr" ? (
                <span className={styles.badgePaid}>Đã thanh toán (Theo mô phỏng)</span>
              ) : (
                <span className={styles.badgeUnpaid}>Thanh toán khi nhận hàng (Chưa thanh toán)</span>
              )}
            </div>
          </div>
        </div>

        {/* LƯU Ý DÀNH CHO KHÁCH CHỌN TIỀN MẶT */}
        {method === "cash" && (
          <div className={styles.cashReminderBox}>
            <strong>Lưu ý giao nhận tiền mặt (COD):</strong>
            <p className="mb-0 mt-1">
              Quý khách vui lòng chuẩn bị đúng số tiền{" "}
              <strong>{formatCurrency(lastOrder?.finalTotal || 0)}</strong> để thanh toán trực tiếp cho nhân viên bưu tá khi nhận hàng.
            </p>
          </div>
        )}

        {/* Thông tin người nhận */}
        <h2 className={styles.sectionTitle}>Thông tin người nhận</h2>
        <ul className={styles.infoList}>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Người nhận:</span>
            <span className={styles.infoValue}>
              {lastOrder?.customer?.fullName || "Nguyễn Văn A"} - {lastOrder?.customer?.phone || "0912345678"}
            </span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Địa chỉ giao:</span>
            <span className={styles.infoValue}>
              {lastOrder?.customer?.address || "Hà Nội"}
            </span>
          </li>
          <li className={styles.infoItem}>
            <span className={styles.infoLabel}>Phương thức:</span>
            <span className={styles.infoValue}>
              {method === "qr" ? "Quét mã QR chuyển khoản ngân hàng" : "Thanh toán tiền mặt khi nhận hàng (COD)"}
            </span>
          </li>
          {lastOrder?.customer?.note && (
            <li className={styles.infoItem}>
              <span className={styles.infoLabel}>Ghi chú:</span>
              <span className={styles.infoValue}>{lastOrder?.customer?.note}</span>
            </li>
          )}
        </ul>

        {/* Danh sách sản phẩm trong đơn */}
        <h2 className={styles.sectionTitle}>Sản phẩm đã đặt</h2>
        <table className={styles.itemListTable}>
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>SL</th>
              <th className="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {(lastOrder?.items || []).map((item) => (
              <tr key={`${item.id}-${item.size}`}>
                <td>
                  <div className="d-flex align-items-center">
                    <img src={item.image} alt={item.name} className={styles.itemThumbSmall} />
                    <div>
                      <div className="fw-bold" style={{ color: "#284e70" }}>{item.name}</div>
                      <small className="text-muted">Size: {item.size}</small>
                    </div>
                  </div>
                </td>
                <td>{formatCurrency(item.price)}</td>
                <td>{item.quantity}</td>
                <td className="text-end fw-bold" style={{ color: "#284e70" }}>
                  {formatCurrency(item.price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tổng kết tiền */}
        <div className="border-top pt-3 mb-4">
          <div className="d-flex justify-content-between mb-1 small text-muted">
            <span>Tiền hàng:</span>
            <span>{formatCurrency(lastOrder?.subTotal || 0)}</span>
          </div>
          <div className="d-flex justify-content-between mb-2 small text-muted">
            <span>Phí vận chuyển:</span>
            <span>{formatCurrency(lastOrder?.shippingFee || 30000)}</span>
          </div>
          <div className="d-flex justify-content-between fs-5 fw-bold" style={{ color: "#284e70" }}>
            <span>Tổng thanh toán:</span>
            <span>{formatCurrency(lastOrder?.finalTotal || 0)}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className={styles.actionButtonGroup}>
          <Link to="/" className={styles.btnPrimary}>
            <Home size={18} />
            <span>Tiếp tục mua sắm</span>
          </Link>
          <Link to="/cart" className={styles.btnSecondary}>
            <ShoppingBag size={18} />
            <span>Xem giỏ hàng</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderResultPage;
