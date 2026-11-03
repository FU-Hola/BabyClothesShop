import { useParams } from "react-router-dom";
import WarehouseDetail from "../components/WarehouseDetail.jsx";
import { ActionForm, InputField } from "../components/WarehouseForms.jsx";
import { DataTable, DetailFields, PageHeading, StatusBadge } from "../components/WarehouseUI.jsx";
import { cancelReceiptSchema, confirmReceiptSchema } from "../schema/warehouse.schemas.js";
import { dateOnly, dateTime, display } from "../utils/warehouse.format.js";

function ReceiptContent({ data, ...actions }) {
    const pending = data.goodsReceiptStatus === "PENDING";
    const common = { resource: "receipt", id: data.goodsReceiptId, ...actions };
    return (
        <>
            <PageHeading
                title={`Phiếu nhập ${data.code}`}
                description="Xác nhận hoặc hủy toàn bộ phiếu. Tồn kho tăng theo số lượng thực nhận."
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
            {pending ? (
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
            {pending && (
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
    return (
        <WarehouseDetail key={receiptId} resource="receipt" id={receiptId}>
            {(props) => <ReceiptContent {...props} />}
        </WarehouseDetail>
    );
}
