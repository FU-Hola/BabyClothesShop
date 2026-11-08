import { useEffect, useState } from "react";
import { ChevronRight, Package } from "lucide-react";
import { Pagination } from "react-bootstrap";
import { Link, useSearchParams } from "react-router-dom";
import { getMyOrders } from "./customerOrderApi.js";
import styles from "./Orders.module.css";

const PAGE_SIZE = 9;

const FALLBACK_IMAGE = "/images/products/sample-baby-romper.png";

const STATUS_FILTERS = [
    { value: "", label: "Đã đặt" },
    { value: "PENDING_CONFIRMATION", label: "Chờ xác nhận" },
    { value: "CONFIRMED", label: "Đã xác nhận" },
    { value: "PACKED", label: "Đã đóng gói" },
    { value: "SHIPPING", label: "Đang giao" },
    { value: "DELIVERED", label: "Đã giao" },
    { value: "CANCELLED", label: "Đã hủy" },
];

const STATUS_LABELS = {
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

const OrderHistory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const status = searchParams.get("status") || "";
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const visibleOrders = status
        ? orders.filter((order) => order.status === status)
        : orders;
    const totalPages = Math.max(1, Math.ceil(visibleOrders.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageOrders = visibleOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [status]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getMyOrders()
            .then((data) => {
                if (!cancelled) {
                    setOrders(Array.isArray(data) ? data : []);
                    setError("");
                }
            })
            .catch((failure) => {
                if (!cancelled) {
                    setOrders([]);
                    setError(failure.response?.data?.message || "Không tải được đơn hàng. Hãy đăng nhập bằng tài khoản khách hàng.");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className={styles.page}>
            <nav className={styles.breadcrumb} aria-label="Đường dẫn trang">
                <Link to="/">Trang chủ</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <Link to="/cart">Giỏ hàng</Link>
                <ChevronRight size={14} aria-hidden="true" />
                <span aria-current="page">Đơn hàng của tôi</span>
            </nav>

            <header className={styles.pageHeading}>
                <span className={styles.eyebrow}>Tài khoản khách hàng</span>
                <h1>Đơn hàng của tôi</h1>
                <p>Xem lại các đơn đã đặt và lọc theo trạng thái xử lý.</p>
            </header>

            <div className={styles.historyLayout}>
                <aside className={styles.accountSidebar} aria-label="Tài khoản">
                    <Package size={24} aria-hidden="true" />
                    <span>Đơn hàng của tôi</span>
                </aside>

                <section className={styles.orderList} aria-label="Lịch sử đơn hàng">
                    <div className={styles.filters} role="tablist" aria-label="Lọc theo trạng thái">
                        {STATUS_FILTERS.map((filter) => (
                            <button
                                key={filter.value || "all"}
                                type="button"
                                role="tab"
                                aria-selected={status === filter.value}
                                className={status === filter.value ? styles.filterActive : styles.filter}
                                onClick={() => setSearchParams(filter.value ? { status: filter.value } : {})}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.listHeading}>
                        <h2>{STATUS_FILTERS.find((filter) => filter.value === status)?.label || "Đã đặt"}</h2>
                        <span>{loading ? "Đang tải..." : `${visibleOrders.length} đơn hàng`}</span>
                    </div>

                    {error ? <p>{error}</p> : null}
                    {!loading && !error && visibleOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Chưa có đơn hàng ở trạng thái này.</p>
                            <Link to="/ao-thun">Khám phá sản phẩm</Link>
                        </div>
                    ) : null}
                    {pageOrders.length > 0 ? (
                        <div className={styles.orderGrid}>
                            {pageOrders.map((order) => (
                                <article className={styles.orderCard} key={order.id}>
                                    <div className={styles.orderCardHeader}>
                                        <div>
                                            <span className={styles.smallLabel}>Mã đơn hàng</span>
                                            <h3>{order.orderCode}</h3>
                                            <p>Đặt ngày {formatDate(order.createdAt)}</p>
                                        </div>
                                        <span className={`${styles.status} ${styles[order.status] || ""}`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </div>

                                    <div className={styles.orderPreview}>
                                        <div
                                            className={styles.previewImage}
                                            role="img"
                                            aria-label={order.previewItem?.productName || order.orderCode}
                                            style={{ backgroundImage: `url("${order.previewItem?.imageUrl || FALLBACK_IMAGE}")` }}
                                        />
                                        <div className={styles.previewInfo}>
                                            <strong>{order.previewItem?.productName || "Sản phẩm"}</strong>
                                            <span>
                                                {order.previewItem?.color || "—"} · Size {order.previewItem?.size || "—"}
                                            </span>
                                            <span>Số lượng: {order.previewItem?.quantity || order.totalQuantity || 0}</span>
                                            {order.lineCount > 1 ? <span>+ {order.lineCount - 1} sản phẩm khác</span> : null}
                                        </div>
                                    </div>

                                    <div className={styles.orderCardFooter}>
                                        <div>
                                            <span>Tổng thanh toán</span>
                                            <strong>{formatPrice(order.totalAmount)}</strong>
                                        </div>
                                        <Link className={styles.detailLink} to={`/don-hang/${order.id}`}>
                                            Xem chi tiết <ChevronRight size={16} aria-hidden="true" />
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : null}
                    {!loading && !error && totalPages > 1 ? (
                        <div className={styles.paginationRow}>
                            <div className="text-muted small">
                                Tìm thấy <span className="fw-semibold text-dark">{visibleOrders.length}</span> đơn hàng
                            </div>
                            <Pagination size="sm" className="mb-0">
                                <Pagination.Prev
                                    disabled={currentPage === 1}
                                    onClick={() => setPage(currentPage - 1)}
                                >
                                    Trước
                                </Pagination.Prev>
                                {Array.from({ length: totalPages }, (_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <Pagination.Item
                                            key={pageNumber}
                                            active={currentPage === pageNumber}
                                            onClick={() => setPage(pageNumber)}
                                        >
                                            {pageNumber}
                                        </Pagination.Item>
                                    );
                                })}
                                <Pagination.Next
                                    disabled={currentPage === totalPages}
                                    onClick={() => setPage(currentPage + 1)}
                                >
                                    Sau
                                </Pagination.Next>
                            </Pagination>
                        </div>
                    ) : null}
                </section>
            </div>
        </div>
    );
};

export default OrderHistory;
