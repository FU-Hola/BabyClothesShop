import { ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { formatPrice, orders, subtotalOf } from "./orders";
import styles from "./Orders.module.css";

const OrderHistory = () => (
    <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
            <Link to="/">Trang chủ</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span aria-current="page">Đơn hàng của tôi</span>
        </nav>

        <header className={styles.pageHeading}>
            <span className={styles.eyebrow}>Tài khoản khách hàng</span>
            <h1>Đơn hàng của tôi</h1>
            <p>Xem lại các đơn đã đặt và theo dõi thông tin từng đơn hàng.</p>
        </header>

        <div className={styles.historyLayout}>
            <aside className={styles.accountSidebar} aria-label="Tài khoản">
                <Package size={24} aria-hidden="true" />
                <span>Đơn hàng của tôi</span>
            </aside>

            <section className={styles.orderList} aria-label="Lịch sử đơn hàng">
                <div className={styles.listHeading}>
                    <h2>Đơn đã đặt</h2>
                    <span>{orders.length} đơn hàng</span>
                </div>

                {orders.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Bạn chưa có đơn hàng nào.</p>
                        <Link to="/ao-so-mi">Khám phá sản phẩm</Link>
                    </div>
                ) : (
                    orders.map((order) => (
                        <article className={styles.orderCard} key={order.id}>
                            <div className={styles.orderCardHeader}>
                                <div>
                                    <span className={styles.smallLabel}>Mã đơn hàng</span>
                                    <h3>{order.id}</h3>
                                    <p>Đặt ngày {order.placedAt}</p>
                                </div>
                                <span className={`${styles.status} ${styles[order.statusType]}`}>{order.status}</span>
                            </div>

                            <div className={styles.orderPreview}>
                                <div className={styles.previewImage} role="img" aria-label={order.items[0].name} style={{ backgroundImage: `url("${order.items[0].image}")` }} />
                                <div className={styles.previewInfo}>
                                    <strong>{order.items[0].name}</strong>
                                    <span>{order.items[0].brand} · {order.items[0].color} · Size {order.items[0].size}</span>
                                    <span>Số lượng: {order.items[0].quantity}</span>
                                    {order.items.length > 1 ? <span>+ {order.items.length - 1} sản phẩm khác</span> : null}
                                </div>
                            </div>

                            <div className={styles.orderCardFooter}>
                                <div>
                                    <span>Tổng thanh toán</span>
                                    <strong>{formatPrice(subtotalOf(order) + order.shippingFee)}</strong>
                                </div>
                                <Link className={styles.detailLink} to={`/don-hang/${order.id}`}>
                                    Xem chi tiết <ChevronRight size={16} aria-hidden="true" />
                                </Link>
                            </div>
                        </article>
                    ))
                )}
            </section>
        </div>
    </div>
);

export default OrderHistory;
