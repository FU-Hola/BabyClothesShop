import "../../../../../shared/styles/warehouse.css";
import useAuth from "../../../../auth/hooks/useAuth.js";
import { useParams } from "react-router-dom";
import WarehouseDetail from "../../../application/components/WarehouseDetail.jsx";
import { ActionForm } from "../../../application/components/ActionForm.jsx";
import { InputField } from "../../../../../shared/components/InputField.jsx";
import {
    DataTable,
    DetailFields,
    PageHeading,
    StatusBadge,
} from "../../../../../shared/components/WarehouseUI.jsx";
import { cancelReceiptSchema, confirmReceiptSchema } from "../schemas/receipt.schemas.js";
import { dateOnly, dateTime, display } from "../../../../../shared/utils/warehouse.format.js";

function ReceiptContent({ data, ...actions }) {
    const { user } = useAuth();
    const canConfirm = user?.role === "WAREHOUSE_STAFF";
    const canCancel = user?.role === "STORE_STAFF";
    const pending = data.goodsReceiptStatus === "PENDING";
    const common = { resource: "receipt", id: data.goodsReceiptId, ...actions };
    return (
        <>
            <PageHeading
                title={`Phiếu nhập ${data.code}`}
                description={canConfirm
                    ? "Xác nhận toàn bộ phiếu. Tồn kho tăng theo số lượng thực nhận."
                    : "Theo dõi kết quả nhập kho. Có thể hủy phiếu khi Warehouse chưa xác nhận."}
            >
                <StatusBadge status={data.goodsReceiptStatus} />
            </PageHeading>
            <section className="admin-card p-4 mb-4">
                <h2 className="h5">Thông tin phiếu nhập</h2>
                <DetailFields
                    fields={[
                        ["Nhà cung cấp", data.supplierName],
                        ["Ngày dự kiến", dateOnly(data.expectedDate)],
                        ["Ngày tạo", dateTime(data.createdAt)],
                        ["Người tạo (ID)", data.createdBy],
                        ["Ghi chú", display(data.note)],
                        ...(data.goodsReceiptStatus === "COMPLETED"
                            ? [
                                  ["Xác nhận lúc", dateTime(data.confirmedAt)],
                                  ["Ghi chú chênh lệch", display(data.discrepancyNote)],
                              ]
                            : []),
                        ...(data.goodsReceiptStatus === "CANCELLED"
                            ? [
                                  ["Hủy lúc", dateTime(data.cancelledAt)],
                                  ["Lý do hủy", display(data.cancellationReason)],
                              ]
                            : []),
                    ]}
                />
            </section>
            {pending && canConfirm ? (
                <ActionForm
                    {...common}
                    action="confirm"
                    schema={confirmReceiptSchema(data)}
                    defaultValues={{
                        version: data.version,
                        goodsReceiptStatus: "COMPLETED",
                        discrepancyNote: "",
                        items: data.items.map((item) => ({
                            receiptItemId: item.goodsReceiptItemId,
                            receivedQuantity: "",
                        })),
                    }}
                    title="Xác nhận nhập kho"
                    description="Nhập số lượng thực nhận cho tất cả các dòng. Khi khác dự kiến, cần ghi chú chênh lệch."
                    confirmText="Xác nhận hoàn tất toàn bộ phiếu và tăng tồn kho theo số lượng thực nhận?"
                >
                    <DataTable
                        headers={["Sản phẩm / SKU", "Biến thể", "Dự kiến", "Thực nhận"]}
                        empty={!data.items.length}
                    >
                        {data.items.map((item, index) => (
                            <tr key={item.goodsReceiptItemId}>
                                <td>
                                    {display(item.productName)}
                                    <small className="d-block">{display(item.sku)}</small>
                                </td>
                                <td>
                                    {display(item.color)} / {display(item.size)}
                                </td>
                                <td>{item.expectedQuantity}</td>
                                <td>
                                    <InputField
                                        name={`items.${index}.receivedQuantity`}
                                        label={`Thực nhận ${item.sku || index + 1}`}
                                        type="number"
                                        min={0}
                                        max={2147483647}
                                        step={1}
                                    />
                                </td>
                            </tr>
                        ))}
                    </DataTable>
                    <InputField
                        name="discrepancyNote"
                        label="Ghi chú chênh lệch"
                        as="textarea"
                        rows={3}
                        maxLength={1000}
                    />
                </ActionForm>
            ) : (
                <DataTable
                    headers={[
                        "Sản phẩm",
                        "SKU",
                        "Danh mục",
                        "Màu / Kích thước",
                        "Dự kiến",
                        "Thực nhận",
                    ]}
                    empty={!data.items.length}
                >
                    {data.items.map((item) => (
                        <tr key={item.goodsReceiptItemId}>
                            <td>{display(item.productName)}</td>
                            <td>{display(item.sku)}</td>
                            <td>{display(item.categoryName)}</td>
                            <td>
                                {display(item.color)} / {display(item.size)}
                            </td>
                            <td>{item.expectedQuantity}</td>
                            <td>{display(item.receivedQuantity)}</td>
                        </tr>
                    ))}
                </DataTable>
            )}
            {pending && canCancel && (
                <ActionForm
                    {...common}
                    action="cancel"
                    schema={cancelReceiptSchema}
                    defaultValues={{ version: data.version, note: "" }}
                    title="Hủy phiếu nhập"
                    danger
                    description="Hủy toàn bộ phiếu và không thay đổi tồn kho."
                    confirmText="Hủy toàn bộ phiếu nhập này?"
                >
                    <InputField
                        name="note"
                        label="Lý do hủy (không bắt buộc)"
                        as="textarea"
                        rows={2}
                        maxLength={1000}
                    />
                </ActionForm>
            )}
        </>
    );
}
export default function GoodsReceiptDetailPage() {
    const { receiptId } = useParams();
    const { user } = useAuth();
    const listPath = user?.role === "STORE_STAFF"
        ? "/store-staff/goods-receipts"
        : "/warehouse-staff/goods-receipts";
    return (
        <WarehouseDetail key={receiptId} resource="receipt" id={receiptId} listPath={listPath}>
            {(props) => <ReceiptContent {...props} />}
        </WarehouseDetail>
    );
}
