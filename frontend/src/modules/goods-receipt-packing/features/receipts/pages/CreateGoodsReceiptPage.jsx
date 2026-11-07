import { useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button } from "react-bootstrap";
import { useFieldArray, useFormContext } from "react-hook-form";
import { ActionForm } from "../../../application/components/ActionForm.jsx";
import { InputField } from "../../../../../shared/components/InputField.jsx";
import ReceiptProductPicker from "../components/ReceiptProductPicker.jsx";
import { DataTable, PageHeading } from "../../../../../shared/components/WarehouseUI.jsx";
import { createReceiptSchema } from "../schemas/receipt.schemas.js";
import { display } from "../../../../../shared/utils/warehouse.format.js";

function ReceiptLines() {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: "items" });
    const [choosing, setChoosing] = useState(false);
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="h6 mb-0">Hàng nhập ({fields.length}/200)</h3>
                <Button
                    type="button"
                    variant="outline-primary"
                    disabled={fields.length >= 200}
                    onClick={() => setChoosing(true)}
                >
                    Chọn sản phẩm / SKU
                </Button>
            </div>
            <DataTable
                headers={["Sản phẩm", "SKU / Biến thể", "Số lượng dự kiến", "Thao tác"]}
                empty={!fields.length}
                emptyTitle="Chưa chọn hàng nhập"
                emptyDescription="Chọn sản phẩm trong kho và các SKU cần nhập."
            >
                {fields.map((item, index) => (
                    <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td>
                            {item.sku}
                            <small className="d-block text-muted">
                                {display(item.color)} / {display(item.size)}
                            </small>
                        </td>
                        <td>
                            <InputField
                                name={`items.${index}.expectedQuantity`}
                                label={`Số lượng ${item.sku}`}
                                type="number"
                                min={1}
                                max={2147483647}
                                step={1}
                            />
                        </td>
                        <td>
                            <Button
                                type="button"
                                variant="outline-danger"
                                onClick={() => remove(index)}
                                aria-label={`Xóa ${item.sku}`}
                            >
                                Xóa
                            </Button>
                        </td>
                    </tr>
                ))}
            </DataTable>
            {choosing && (
                <ReceiptProductPicker
                    existingIds={fields.map((item) => item.variantId)}
                    onAdd={append}
                    onClose={() => setChoosing(false)}
                />
            )}
        </>
    );
}

export default function CreateGoodsReceiptPage() {
    const [result, setResult] = useState(null);
    return (
        <div className="goods-receipt-packing">
            <PageHeading
                title="Tạo phiếu nhập kho"
                description="Chọn SKU đã có trong kho. Phiếu mới ở trạng thái chờ xử lý và chưa tăng tồn kho."
            >
                <Button as={Link} to="/warehouse-staff/goods-receipts" variant="outline-secondary">
                    Danh sách phiếu nhập
                </Button>
            </PageHeading>
            {result && (
                <Alert variant={result.refreshFailed ? "warning" : "success"}>
                    Đã tạo phiếu nhập.{" "}
                    {result.refreshFailed &&
                        "Danh sách chưa tải lại được; vui lòng tải lại khi mở danh sách."}{" "}
                    <Link to="/warehouse-staff/goods-receipts">Xem danh sách phiếu nhập</Link>
                </Alert>
            )}
            <ActionForm
                resource="receipt"
                action="create"
                schema={createReceiptSchema}
                defaultValues={{ supplierName: "", expectedDate: "", note: "", items: [] }}
                title="Tạo phiếu nhập"
                onCompleted={setResult}
                confirmText="Tạo phiếu nhập với các SKU và số lượng dự kiến đã chọn?"
            >
                <div className="warehouse-detail-grid">
                    <InputField name="supplierName" label="Nhà cung cấp *" maxLength={255} />
                    <InputField name="expectedDate" label="Ngày dự kiến nhập *" type="date" />
                </div>
                <InputField name="note" label="Ghi chú" as="textarea" rows={3} maxLength={1000} />
                <ReceiptLines />
            </ActionForm>
        </div>
    );
}
