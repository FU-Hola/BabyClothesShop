import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ClipboardList, MapPin, Package, Search, Truck, Wallet } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { formatPrice, subtotalOf } from "../../../app/pages/Orders/orders";
import { loadStaffOrders, saveStaffStatus, STATUS } from "./staffOrders";
import styles from "./StaffOrders.module.css";

const filters = ["all", "pending", "confirmed", "shipping", "delivered", "cancelled"];

export default function StaffOrders() {
    const { orderId } = useParams();
    const [orders, setOrders] = useState(loadStaffOrders);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [confirmId, setConfirmId] = useState(null);
    const [notice, setNotice] = useState("");
    const cancelButton = useRef(null);
    const order = orders.find((item) => item.id === orderId);
    const pendingAction = orders.find((item) => item.id === confirmId);
    const visibleOrders = orders.filter((item) =>
        (filter === "all" || item.statusType === filter) &&
        `${item.id} ${item.receiver.name} ${item.receiver.phone}`.toLocaleLowerCase("vi-VN").includes(search.trim().toLocaleLowerCase("vi-VN"))
    );

    useEffect(() => {
        if (!confirmId) return undefined;
        const previousFocus = document.activeElement;
        cancelButton.current?.focus();
        function onKeyDown(event) {
            if (event.key === "Escape") setConfirmId(null);
            if (event.key === "Tab") {
                const buttons = cancelButton.current?.parentElement?.querySelectorAll("button");
                if (!buttons?.length) return;
                if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
                else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
            }
        }
        document.addEventListener("keydown", onKeyDown);
        return () => { document.removeEventListener("keydown", onKeyDown); previousFocus?.focus(); };
    }, [confirmId]);

    function advanceOrder() {
        if (!pendingAction) return;
        const next = STATUS[pendingAction.statusType].next;
        if (!next) return;
        saveStaffStatus(pendingAction.id, next);
        setOrders((current) => current.map((item) => item.id === pendingAction.id
            ? { ...item, statusType: next, status: STATUS[next].label }
            : item));
        setNotice(`Đơn ${pendingAction.id} đã chuyển sang trạng thái “${STATUS[next].label}”.`);
        setConfirmId(null);
    }

    return (
        <div className={styles.page}>
            {orderId ? (
                order ? <>
                    <Link className={styles.back} to="/store-staff/orders"><ArrowLeft size={17} /> Trở về danh sách đơn hàng</Link>
                    <div className={styles.headingRow}><div><span className={styles.kicker}>CHI TIẾT ĐƠN HÀNG</span><h1>{order.id}</h1><p>Đặt ngày {order.placedAt} · Khách hàng {order.receiver.name}</p></div><span className={`${styles.status} ${styles[order.statusType]}`}>{order.status}</span></div>
                    <div className={styles.detailGrid}>
                        <div className={styles.detailStack}>
                            <section className={styles.panel}><div className={styles.panelHeading}><Package size={19} /><h2>Sản phẩm trong đơn</h2><span>{order.items.length} sản phẩm</span></div>
                                {order.items.map((item) => <div className={styles.product} key={item.id}><img src={item.image} alt={item.name} /><div><strong>{item.name}</strong><small>{item.brand} · {item.color} · Size {item.size}</small><small>Số lượng: {item.quantity}</small></div><strong className={styles.productPrice}>{formatPrice(item.price * item.quantity)}</strong></div>)}
                            </section>
                            <section className={styles.panel}><div className={styles.panelHeading}><MapPin size={19} /><h2>Thông tin giao hàng</h2></div><div className={styles.address}><strong>{order.receiver.name}</strong><span>{order.receiver.phone}</span><span>{order.receiver.address}</span></div></section>
                        </div>
                        <div className={styles.detailStack}>
                            <section className={styles.panel}><div className={styles.panelHeading}><Truck size={19} /><h2>Tiến trình đơn hàng</h2></div><ol className={styles.timeline}>{["pending", "confirmed", "shipping", "delivered"].map((step, index) => { const currentIndex = ["pending", "confirmed", "shipping", "delivered"].indexOf(order.statusType); return <li key={step} className={index <= currentIndex ? styles.stepDone : ""}><span className={styles.stepDot}>{index < currentIndex ? <Check size={12} /> : null}</span><span>{STATUS[step].label}</span></li>; })}</ol>{order.statusType === "cancelled" && <p className={styles.cancelledNote}>Đơn hàng này đã bị hủy.</p>}{STATUS[order.statusType].next && <button className={styles.primaryButton} onClick={() => setConfirmId(order.id)}>{STATUS[order.statusType].action} <ArrowRight size={16} /></button>}</section>
                            <section className={styles.panel}><div className={styles.panelHeading}><Wallet size={19} /><h2>Thanh toán</h2></div><div className={styles.priceRow}><span>Tạm tính</span><span>{formatPrice(subtotalOf(order))}</span></div><div className={styles.priceRow}><span>Phí vận chuyển</span><span>{order.shippingFee ? formatPrice(order.shippingFee) : "Miễn phí"}</span></div><div className={`${styles.priceRow} ${styles.total}`}><strong>Tổng thanh toán</strong><strong>{formatPrice(subtotalOf(order) + order.shippingFee)}</strong></div><p className={styles.paymentMethod}>{order.paymentMethod}</p></section>
                        </div>
                    </div>
                </> : <div className={styles.notFound}><h1>Không tìm thấy đơn hàng</h1><p>Kiểm tra lại mã đơn hoặc quay về danh sách.</p><Link to="/store-staff/orders">Quay về danh sách</Link></div>
            ) : <>
                <header className={styles.pageHeader}><div><span className={styles.kicker}>STORE STAFF / ORDERS</span><h1>Quản lý đơn hàng</h1><p>Theo dõi và xử lý đơn hàng của cửa hàng tại một nơi.</p></div><span className={styles.dateTag}>Tổng cộng <strong>{orders.length} đơn hàng</strong></span></header>
                <div className={styles.stats}>
                    {[{ label: "Chờ xác nhận", key: "pending", icon: ClipboardList }, { label: "Đã xác nhận", key: "confirmed", icon: Check }, { label: "Đang giao", key: "shipping", icon: Truck }, { label: "Đã giao", key: "delivered", icon: Package }].map(({ label, key, icon: Icon }) => <div className={styles.stat} key={key}><span className={`${styles.statIcon} ${styles[key]}`}><Icon size={19} /></span><span className={styles.statLabel}>{label}</span><strong>{orders.filter((item) => item.statusType === key).length.toString().padStart(2, "0")}</strong></div>)}
                </div>
                <section className={styles.listPanel} aria-label="Danh sách đơn hàng"><div className={styles.listIntro}><div><h2>Danh sách đơn hàng</h2><p>Tìm kiếm và cập nhật trạng thái các đơn hàng.</p></div><span>{visibleOrders.length} kết quả</span></div>
                    <div className={styles.toolbar}><div className={styles.filters} aria-label="Lọc theo trạng thái">{filters.map((key) => <button key={key} className={filter === key ? styles.filterActive : ""} aria-pressed={filter === key} onClick={() => setFilter(key)}>{key === "all" ? "Tất cả" : STATUS[key].label}{key === "all" && <span>{orders.length}</span>}</button>)}</div><label className={styles.searchBox}><Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Tìm theo mã đơn, tên hoặc số điện thoại</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã đơn, khách hàng..." type="search" /></label></div>
                    <div className={styles.tableWrap}><table><thead><tr><th>MÃ ĐƠN HÀNG</th><th>KHÁCH HÀNG</th><th>NGÀY ĐẶT</th><th>TỔNG TIỀN</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{visibleOrders.map((item) => <tr key={item.id}><td><Link className={styles.orderId} to={`/store-staff/orders/${item.id}`}>{item.id}</Link><small>{item.items.length} sản phẩm</small></td><td><strong>{item.receiver.name}</strong><small>{item.receiver.phone}</small></td><td>{item.placedAt}</td><td className={styles.money}>{formatPrice(subtotalOf(item) + item.shippingFee)}</td><td><span className={`${styles.status} ${styles[item.statusType]}`}>{item.status}</span></td><td><div className={styles.rowActions}><Link to={`/store-staff/orders/${item.id}`} className={styles.viewLink}>Chi tiết</Link>{STATUS[item.statusType].next && <button className={styles.actionButton} onClick={() => setConfirmId(item.id)} aria-label={`${STATUS[item.statusType].action} cho đơn ${item.id}`} title={STATUS[item.statusType].action}>{STATUS[item.statusType].action} <ChevronDown className={styles.actionArrow} size={14} /></button>}</div></td></tr>)}</tbody></table></div>
                    {visibleOrders.length === 0 && <div className={styles.empty}><Search size={28} /><strong>Không tìm thấy đơn hàng</strong><p>Thử tìm theo mã đơn, tên khách hàng hoặc chọn trạng thái khác.</p><button onClick={() => { setSearch(""); setFilter("all"); }}>Xóa bộ lọc</button></div>}
                    <div className={styles.listFooter}>Hiển thị {visibleOrders.length} / {orders.length} đơn hàng <span>Dữ liệu minh họa cho prototype</span></div>
                </section>
            </>}
            {notice && <div className={styles.toast} role="status">{notice}<button onClick={() => setNotice("")} aria-label="Đóng thông báo">×</button></div>}
            {pendingAction && <div className={styles.overlay} onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmId(null); }}><div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description"><span className={styles.dialogIcon}><ClipboardList size={22} /></span><h2 id="confirm-title">{STATUS[pendingAction.statusType].actionVi}?</h2><p id="confirm-description">Đơn hàng <strong>{pendingAction.id}</strong> sẽ chuyển sang trạng thái <strong>{STATUS[STATUS[pendingAction.statusType].next].label}</strong>. Bạn muốn tiếp tục?</p><div className={styles.dialogActions}><button ref={cancelButton} onClick={() => setConfirmId(null)}>Quay lại</button><button className={styles.primaryButton} onClick={advanceOrder}>Xác nhận <ArrowRight size={16} /></button></div></div></div>}
        </div>
    );
}
