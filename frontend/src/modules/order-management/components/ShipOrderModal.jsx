import { useEffect, useRef, useState } from "react";
import orderApi from "../api/orderApi";
import styles from "../pages/StaffOrders.module.css";

export default function ShipOrderModal({ order, onClose, onShipped }) {
    const dialogRef = useRef(null);
    const [carrierName, setCarrierName] = useState("");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const dialog = dialogRef.current;
        // Native dialog keeps keyboard focus inside and restores it when closed.
        dialog.showModal();
        return () => dialog.close();
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();
        if (saving) return;

        const data = {
            carrierName: carrierName.trim(),
            trackingNumber: trackingNumber.trim(),
        };
        if (!data.carrierName || !data.trackingNumber) {
            setError("Vui lòng nhập đơn vị vận chuyển và mã vận đơn.");
            return;
        }

        setSaving(true);
        setError("");
        try {
            const updated = await orderApi.shipOrder(order.id, data);
            onShipped(updated);
        } catch (err) {
            setError(err.response?.data?.message
                || "Không thể gửi yêu cầu. Vui lòng kiểm tra kết nối và thử lại.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <dialog ref={dialogRef} className={`${styles.dialog} ${styles.shippingDialog}`}
            aria-labelledby="ship-title" aria-describedby="ship-description" aria-busy={saving}
            onCancel={(event) => {
                event.preventDefault();
                if (!saving) onClose();
            }}>
            <h2 id="ship-title">Ghi nhận đã gửi hàng</h2>
            <p id="ship-description">Đơn <strong>{order.orderCode}</strong> sẽ chuyển sang Đang giao
                và được trừ tồn kho. Chỉ xác nhận sau khi bàn giao cho đơn vị vận chuyển.</p>
            <form onSubmit={handleSubmit}>
                <fieldset className={styles.shippingFields} disabled={saving}>
                    <label htmlFor="ship-carrier">Đơn vị vận chuyển</label>
                    <input id="ship-carrier" name="carrierName" required maxLength={255}
                        value={carrierName} onChange={(event) => setCarrierName(event.target.value)} />

                    <label htmlFor="ship-tracking">Mã vận đơn</label>
                    <input id="ship-tracking" name="trackingNumber" required maxLength={100}
                        value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} />
                </fieldset>
                {error && <p className={styles.errorText} role="alert">{error}</p>}
                <div className={styles.dialogActions}>
                    <button type="button" disabled={saving} onClick={onClose}>Quay lại</button>
                    <button type="submit" className={styles.primaryButton} disabled={saving}>
                        {saving ? "Đang lưu..." : "Xác nhận đã gửi"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
