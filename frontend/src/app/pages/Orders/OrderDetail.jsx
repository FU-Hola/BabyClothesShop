import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight, MapPin, Package, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getMyOrder } from "./customerOrderApi.js";
import styles from "./Orders.module.css";

const FALLBACK_IMAGE = "/images/products/sample-baby-romper.png";

const STATUS_LABELS = {
    PENDING_PAYMENT: "Chờ thanh toán",
    EXPIRED: "Hết hạn thanh toán",
    PENDING_CONFIRMATION: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PACKED: "Đã đóng gói",
    SHIPPING: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
};

const formatPrice = (price) => `${new Intl.NumberFormat("vi-VN").format(price || 0)} đ`;

const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
};

const OrderDetail = () => {
    const { orderId } = useParams();
    const [result, setResult] = useState(null);
    const order = result?.id === orderId ? result.data : null;
    const error = result?.id === orderId ? result.error : '';

    useEffect(() => {
        let cancelled = false;
        getMyOrder(orderId)
            .then((data) => {
                if (!cancelled) setResult({ id: orderId, data });
            })
            .catch((failure) => {
                if (!cancelled) setResult({ id: orderId, error: failure.response?.data?.message || 'Không tìm thấy đơn hàng.' });
            });
        return () => {
            cancelled = true;
        };
    }, [orderId]);

    if (error) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <h1>Không tìm thấy đơn hàng</h1>
                    <p>{error}</p>
                    <Link to="/don-hang">Xem đơn hàng của tôi</Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return <div className={styles.page}><p>Đang tải đơn hàng...</p></div>;
    }

    const subtotal = (order.items || []).reduce(
        (sum, item) => sum + Number(item.unitPrice) * item.quantity,
        0,
    );

    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
                <Link to="/">Trang chủ</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <Link to="/don-hang">Đơn hàng của tôi</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <span aria-current="page">{order.orderCode}</span>
            </nav>

            <Link to="/don-hang" className={styles.backLink}>
                <ArrowLeft size={16} aria-hidden="true" /> Trở lại đơn hàng của tôi
            </Link>

            <header className={styles.detailHeading}>
                <div>
                    <span className={styles.eyebrow}>Chi tiết đơn hàng</span>
                    <h1>Đơn hàng {order.orderCode}</h1>
                    <p>Đặt ngày {formatDate(order.createdAt)}</p>
                </div>
                <span className={`${styles.status} ${styles[order.status] || ""}`}>
                    {STATUS_LABELS[order.status] || order.status}
                </span>
            </header>

            {order.status === "CANCELLED" && (
                <section className={styles.panel} role="status" aria-label="Thông tin hủy đơn">
                    <h2>{order.paymentStatus === "PAID" ? "Đơn hàng đã bị hủy bởi Warehouse" : "Phiên đặt hàng đã hủy"}</h2>
                    <p>Lý do hủy: {order.cancellationReason || "Chưa ghi nhận lý do hủy."}</p>
                    {order.cancelledAt && <p>Thời điểm hủy: {formatDate(order.cancelledAt)}</p>}
                </section>
            )}

            {order.status === "PENDING_PAYMENT" && <section className={styles.panel}>
                <p>Hạn thanh toán: {formatDate(order.paymentExpiresAt)}</p>
                <Link to={`/checkout/payment?checkout=${encodeURIComponent(order.checkoutKey)}`}>Tiếp tục thanh toán</Link>
            </section>}
            <div className={styles.detailLayout}>
                <div className={styles.detailMain}>
                    <section className={styles.panel} aria-labelledby="order-products-heading">
                        <div className={styles.panelTitle}>
                            <Package size={20} aria-hidden="true" />
                            <h2 id="order-products-heading">Sản phẩm ({order.items?.length || 0})</h2>
                        </div>
                        {(order.items || []).map((item) => (
                            <div className={styles.detailItem} key={item.id}>
                                <div
                                    className={styles.itemImage}
                                    role="img"
                                    aria-label={item.productNameSnapshot}
                                    style={{ backgroundImage: `url("${item.imageUrlSnapshot || FALLBACK_IMAGE}")` }}
                                />
                                <div className={styles.itemInfo}>
                                    <span>{item.skuSnapshot}</span>
                                    <h3>{item.productNameSnapshot}</h3>
                                    <p>{item.colorSnapshot} · Size {item.sizeSnapshot}</p>
                                    <p>Số lượng: {item.quantity}</p>
                                </div>
                                <strong>{formatPrice(Number(item.unitPrice) * item.quantity)}</strong>
                            </div>
                        ))}
                    </section>

                    <section className={styles.panel} aria-labelledby="receiver-heading">
                        <div className={styles.panelTitle}>
                            <MapPin size={20} aria-hidden="true" />
                            <h2 id="receiver-heading">Thông tin người nhận</h2>
                        </div>
                        <div className={styles.receiver}>
                            <strong>{order.receiverName}</strong>
                            <span>{order.receiverPhone}</span>
                            <span>{order.receiverAddress}</span>
                            {order.customerNote ? <span>Ghi chú: {order.customerNote}</span> : null}
                        </div>
                    </section>
                </div>

                <aside className={styles.detailSide} aria-label="Thanh toán đơn hàng">
                    <section className={styles.panel} aria-labelledby="payment-heading">
                        <div className={styles.panelTitle}>
                            <Wallet size={20} aria-hidden="true" />
                            <h2 id="payment-heading">Thanh toán</h2>
                        </div>
                        <dl className={styles.totals}>
                            <div><dt>Tạm tính</dt><dd>{formatPrice(subtotal)}</dd></div>
                            <div><dt>Phí vận chuyển</dt><dd>{Number(order.shippingFee) === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</dd></div>
                            <div className={styles.grandTotal}><dt>Tổng thanh toán</dt><dd>{formatPrice(order.totalAmount)}</dd></div>
                        </dl>
                        <p className={styles.paymentMethod}>
                            {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </p>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default OrderDetail;
