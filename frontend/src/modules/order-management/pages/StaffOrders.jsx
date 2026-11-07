import { useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin, Package, Search, Truck, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import orderApi from "../api/orderApi";
import styles from "./StaffOrders.module.css";

const statuses = {
    PENDING_CONFIRMATION: { label: "Chờ xác nhận", style: "pending" },
    CONFIRMED: { label: "Đã xác nhận", style: "confirmed" },
    PACKED: { label: "Đã đóng gói", style: "packed" },
    SHIPPING: { label: "Đang giao", style: "shipping" },
    DELIVERED: { label: "Đã giao", style: "delivered" },
};
const steps = Object.keys(statuses);
const pageSize = 10;
const formatPrice = (value) => new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND",
}).format(value);
const formatDate = (value) => value ? new Date(value).toLocaleString("vi-VN") : "—";
const errorMessage = (error) => error.response?.data?.message
    || "Không thể kết nối backend. Vui lòng kiểm tra và thử lại.";

function StatusBadge({ status }) {
    const info = statuses[status];
    return <span className={`${styles.status} ${styles[info?.style] || ""}`}>{info?.label || status}</span>;
}

export default function StaffOrders() {
    const { orderId } = useParams();
    const [orders, setOrders] = useState([]);
    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notFound, setNotFound] = useState(false);
    const [reload, setReload] = useState(0);


    useEffect(() => {
        let active = true;

        async function loadData() {
            setLoading(true);
            setError("");
            setNotFound(false);
            try {
                if (orderId) {
                    const detail = await orderApi.getOrder(orderId);
                    if (active) setOrder(detail);
                } else {
                    const result = await orderApi.getOrders({
                        page, size: pageSize, search, status: status || undefined,
                    });
                    if (active) {
                        setOrders(result.items);
                        setTotalItems(result.totalItems);
                        setTotalPages(result.totalPages);
                    }
                }
            } catch (err) {
                if (active) {
                    setError(errorMessage(err));
                    setNotFound(Boolean(orderId && err.response?.status === 404));
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();
        return () => { active = false; };
    }, [orderId, page, search, status, reload]);

    function handleSearch(event) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
        setReload((value) => value + 1);
    }

    return (
        <div className={styles.page}>
            {orderId && <Link className={styles.back} to="/store-staff/orders">
                <ArrowLeft size={17} /> Trở về danh sách đơn hàng
            </Link>}

            {!orderId && <>
                <header className={styles.pageHeader}>
                    <div><span className={styles.kicker}>STORE STAFF / ORDERS</span>
                        <h1>Quản lý đơn hàng</h1><p>Tìm kiếm, theo dõi và xác nhận đơn hàng.</p></div>
                </header>
                <section className={styles.listPanel} aria-label="Danh sách đơn hàng" aria-busy={loading}>
                    <div className={styles.listIntro}><h2>Danh sách đơn hàng</h2>
                        {!loading && !error && <span>{totalItems} kết quả</span>}</div>
                    <div className={styles.toolbar}>
                        <div className={styles.filters} aria-label="Lọc theo trạng thái">
                            {["", ...steps].map((value) => <button key={value}
                                className={status === value ? styles.filterActive : ""}
                                aria-pressed={status === value}
                                onClick={() => { setStatus(value); setPage(1); }}>
                                {value ? statuses[value].label : "Tất cả"}
                            </button>)}
                        </div>
                        <form className={styles.searchForm} onSubmit={handleSearch}>
                            <label className={styles.searchBox}>
                                <Search size={17} aria-hidden="true" />
                                <span className={styles.srOnly}>Tìm mã đơn, tên hoặc số điện thoại</span>
                                <input type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Mã đơn, tên, số điện thoại..." />
                            </label>
                            <button className={styles.actionButton} type="submit">Tìm kiếm</button>
                        </form>
                    </div>
                    {!loading && !error && <>
                        <div className={styles.tableWrap}><table>
                            <thead><tr><th>MÃ ĐƠN HÀNG</th><th>NGƯỜI NHẬN</th><th>NGÀY ĐẶT</th>
                                <th>TỔNG TIỀN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead>
                            <tbody>{orders.map((item) => <tr key={item.id}>
                                <td><Link className={styles.orderId} to={`/store-staff/orders/${item.id}`}>{item.orderCode}</Link>
                                    <small>{item.lineCount} dòng sản phẩm · {item.totalQuantity} sản phẩm</small></td>
                                <td><strong>{item.receiverName}</strong><small>{item.receiverPhone}</small></td>
                                <td>{formatDate(item.createdAt)}</td>
                                <td className={styles.money}>{formatPrice(item.totalAmount)}</td>
                                <td><StatusBadge status={item.status} /></td>
                                <td><div className={styles.rowActions}>
                                    <Link className={styles.viewLink} to={`/store-staff/orders/${item.id}`}>Chi tiết</Link>
                                </div></td>
                            </tr>)}</tbody>
                        </table></div>
                        {orders.length === 0 && <div className={styles.empty}>Không tìm thấy đơn hàng phù hợp.</div>}
                        <nav className={styles.pagination} aria-label="Phân trang đơn hàng">
                            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Trang trước</button>
                            <span>Trang {page} / {Math.max(1, totalPages)}</span>
                            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Trang sau</button>
                        </nav>
                    </>}
                </section>
            </>}

            {loading && <p className={styles.empty} role="status">Đang tải đơn hàng...</p>}
            {!loading && error && <div className={styles.empty} role="alert">
                <strong>{notFound ? "Không tìm thấy đơn hàng" : "Không tải được dữ liệu"}</strong>
                <p>{error}</p><button onClick={() => setReload((value) => value + 1)}>Thử lại</button>
            </div>}

            {orderId && !loading && !error && order && <>
                <div className={styles.headingRow}>
                    <div><span className={styles.kicker}>CHI TIẾT ĐƠN HÀNG</span><h1>{order.orderCode}</h1>
                        <p>Đặt ngày {formatDate(order.createdAt)}</p></div>
                    <StatusBadge status={order.status} />
                </div>
                <div className={styles.detailGrid}>
                    <div className={styles.detailStack}>
                        <section className={styles.panel}>
                            <div className={styles.panelHeading}><Package size={19} /><h2>Sản phẩm trong đơn</h2></div>
                            {order.items.map((item) => <div className={styles.product} key={item.id}>
                                <img src={item.imageUrlSnapshot || "/images/products/sample-baby-romper.png"}
                                    alt={item.productNameSnapshot} />
                                <div><strong>{item.productNameSnapshot}</strong>
                                    <small>{item.skuSnapshot} · {item.colorSnapshot} · Size {item.sizeSnapshot}</small>
                                    <small>{item.quantity} × {formatPrice(item.unitPrice)}</small></div>
                                <strong className={styles.productPrice}>{formatPrice(item.unitPrice * item.quantity)}</strong>
                            </div>)}
                        </section>
                        <section className={styles.panel}>
                            <div className={styles.panelHeading}><MapPin size={19} /><h2>Thông tin giao hàng</h2></div>
                            <div className={styles.address}><strong>{order.receiverName}</strong>
                                <span>{order.receiverPhone}</span><span>{order.receiverAddress}</span>
                                {order.customerNote && <span>Ghi chú: {order.customerNote}</span>}</div>
                        </section>
                    </div>
                    <div className={styles.detailStack}>
                        <section className={styles.panel}>
                            <div className={styles.panelHeading}><Truck size={19} /><h2>Tiến trình đơn hàng</h2></div>
                            <ol className={styles.timeline}>{steps.map((step, index) =>
                                <li key={step} className={index <= steps.indexOf(order.status) ? styles.stepDone : ""}>
                                    <span className={styles.stepDot}>{index < steps.indexOf(order.status) && <Check size={12} />}</span>
                                    <span>{statuses[step].label}</span>
                                </li>)}</ol>
                            {order.confirmedAt && <p>Đã xác nhận: {formatDate(order.confirmedAt)}</p>}
                            {order.deliveredAt && <p>Đã giao: {formatDate(order.deliveredAt)}</p>}
                            {order.status === "CONFIRMED" && <p>Chờ nhân viên kho đóng gói.</p>}
                        </section>
                        <section className={styles.panel}>
                            <div className={styles.panelHeading}><Wallet size={19} /><h2>Thanh toán</h2></div>
                            <div className={styles.priceRow}><span>Tạm tính</span><span>{formatPrice(order.totalAmount - order.shippingFee)}</span></div>
                            <div className={styles.priceRow}><span>Phí vận chuyển</span><span>{formatPrice(order.shippingFee)}</span></div>
                            <div className={`${styles.priceRow} ${styles.total}`}><strong>Tổng tiền</strong><strong>{formatPrice(order.totalAmount)}</strong></div>
                            <p>{order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"} · Thanh toán mô phỏng</p>
                        </section>
                    </div>
                </div>
            </>}


        </div>
    );
}
