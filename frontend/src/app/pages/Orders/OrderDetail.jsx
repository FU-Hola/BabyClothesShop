import { ArrowLeft, ChevronRight, MapPin, Package, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, orders, subtotalOf } from "./orders";
import styles from "./Orders.module.css";

const OrderDetail = () => {
    const { orderId } = useParams();
    const order = orders.find((item) => item.id === orderId);

    if (!order) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <h1>Không tìm thấy đơn hàng</h1>
                    <p>Vui lòng kiểm tra lại mã đơn hoặc quay về danh sách đơn hàng.</p>
                    <Link to="/don-hang">Xem đơn hàng của tôi</Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
                <Link to="/">Trang chủ</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <Link to="/don-hang">Đơn hàng của tôi</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <span aria-current="page">{order.id}</span>
            </nav>

            <Link to="/don-hang" className={styles.backLink}>
                <ArrowLeft size={16} aria-hidden="true" /> Trở lại đơn hàng của tôi
            </Link>

            <header className={styles.detailHeading}>
                <div>
                    <span className={styles.eyebrow}>Chi tiết đơn hàng</span>
                    <h1>Đơn hàng {order.id}</h1>
                    <p>Đặt ngày {order.placedAt}</p>
                </div>
                <span className={`${styles.status} ${styles[order.statusType]}`}>{order.status}</span>
            </header>

            <div className={styles.detailLayout}>
                <div className={styles.detailMain}>
                    <section className={styles.panel} aria-labelledby="order-products-heading">
                        <div className={styles.panelTitle}>
                            <Package size={20} aria-hidden="true" />
                            <h2 id="order-products-heading">Sản phẩm ({order.items.length})</h2>
                        </div>
                        {order.items.map((item) => (
                            <div className={styles.detailItem} key={item.id}>
                                <div className={styles.itemImage} role="img" aria-label={item.name} style={{ backgroundImage: `url("${item.image}")` }} />
                                <div className={styles.itemInfo}>
                                    <span>{item.brand}</span>
                                    <h3>{item.name}</h3>
                                    <p>{item.color} · Size {item.size}</p>
                                    <p>Số lượng: {item.quantity}</p>
                                </div>
                                <strong>{formatPrice(item.price * item.quantity)}</strong>
                            </div>
                        ))}
                    </section>

                    <section className={styles.panel} aria-labelledby="receiver-heading">
                        <div className={styles.panelTitle}>
                            <MapPin size={20} aria-hidden="true" />
                            <h2 id="receiver-heading">Thông tin người nhận</h2>
                        </div>
                        <div className={styles.receiver}>
                            <strong>{order.receiver.name}</strong>
                            <span>{order.receiver.phone}</span>
                            <span>{order.receiver.address}</span>
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
                            <div><dt>Tạm tính</dt><dd>{formatPrice(subtotalOf(order))}</dd></div>
                            <div><dt>Phí vận chuyển</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</dd></div>
                            <div className={styles.grandTotal}><dt>Tổng thanh toán</dt><dd>{formatPrice(subtotalOf(order) + order.shippingFee)}</dd></div>
                        </dl>
                        <p className={styles.paymentMethod}>{order.paymentMethod}</p>
                    </section>
                </aside>
            </div>
        </div>
    );
};

export default OrderDetail;
