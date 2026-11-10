import useAuth from "../../../../auth/hooks/useAuth.js";
import { useParams } from "react-router-dom";
import { Alert } from "react-bootstrap";
import WarehouseDetail from "../../../application/components/WarehouseDetail.jsx";
import { ActionForm } from "../../../application/components/ActionForm.jsx";
import { InputField } from "../../../../../shared/components/InputField.jsx";
import {
    DataTable,
    DetailFields,
    PageHeading,
    StatusBadge,
} from "../../../../../shared/components/WarehouseUI.jsx";
import {
    cancelIssueSchema,
    exportIssueSchema,
    issueVersionSchema,
    packIssueSchema,
    pickingSchema,
} from "../schemas/issue.schemas.js";
import { dateTime, display } from "../../../../../shared/utils/warehouse.format.js";

function IssueContent({ data, ...actions }) {
    const { user } = useAuth();
    const ownsIssue = data.assignedTo === user?.id;
    const common = { resource: "issue", id: data.id, ...actions };
    const openOrder = ["CONFIRMED", "PACKED"].includes(data.orderStatus);
    const fullyPicked =
        data.items.length > 0 &&
        data.items.every((item) => item.pickedQuantity === item.orderedQuantity);
    const steps = ["PENDING", "PICKING", "PACKED", "EXPORTED"];
    const labels = ["Chờ xử lý", "Soạn hàng", "Đóng gói", "Xuất kho"];
    const orderStatusLabels = {
        PENDING_CONFIRMATION: "Chờ xác nhận",
        CONFIRMED: "Đã xác nhận",
        PACKED: "Đã đóng gói",
        SHIPPING: "Đang giao hàng",
        DELIVERED: "Đã giao hàng",
        CANCELLED: "Đã hủy",
    };


    function lines(editable = false) {
        return (
            <DataTable
                headers={["Sản phẩm / SKU", "Màu / Kích thước", "Số lượng đặt", "Đã soạn"]}
                empty={!data.items.length}
            >
                {data.items.map((item, index) => (
                    <tr key={item.issueItemId}>
                        <td>
                            {item.productName}
                            <small className="d-block">{item.sku}</small>
                        </td>
                        <td>
                            {display(item.color)} / {display(item.size)}
                        </td>
                        <td>{item.orderedQuantity}</td>
                        <td>
                            {editable ? (
                                <InputField
                                    name={`items.${index}.pickedQuantity`}
                                    label={`Đã soạn ${item.sku}`}
                                    type="number"
                                    min={0}
                                    max={item.orderedQuantity}
                                    step={1}
                                />
                            ) : (
                                item.pickedQuantity
                            )}
                        </td>
                    </tr>
                ))}
            </DataTable>
        );
    }


    return (
        <>
            <PageHeading
                title={`Phiếu xuất ${data.code}`}
                description={`Đơn hàng ${data.orderCode}. Hủy phiếu xuất sẽ chuyển đơn hàng sang đã hủy.`}
            >
                <StatusBadge status={data.status} />
            </PageHeading>
            {data.status === "CANCELLED" && data.orderStatus === "CANCELLED" && (
                <Alert variant="secondary" role="status">
                    Phiếu xuất và đơn hàng đã hủy. Không thể tạo lại phiếu. Tồn vật lý không thay đổi; lượng giữ hàng được giải phóng.
                </Alert>
            )}
            {data.status !== "CANCELLED" && (
                <ol className="warehouse-steps admin-card">
                    {steps.map((step, index) => (
                        <li
                            key={step}
                            aria-current={data.status === step ? "step" : undefined}
                            className={data.status === step ? "fw-bold text-dark" : ""}
                        >
                            {labels[index]}
                        </li>
                    ))}
                </ol>
            )}
            <section className="admin-card p-4 mb-4">
                <h2 className="h5">Thông tin giao hàng</h2>
                <DetailFields
                    fields={[
                        ["Người nhận", display(data.receiverName)],
                        ["Điện thoại", display(data.receiverPhone)],
                        ["Địa chỉ", display(data.receiverAddress)],
                        ["Ngày tạo", dateTime(data.createdAt)],
                        ["Trạng thái đơn hàng", orderStatusLabels[data.orderStatus]],
                        ...(data.pickingStartedAt
                            ? [
                                  ["Người soạn (ID)", data.assignedTo],
                                  ["Bắt đầu soạn", dateTime(data.pickingStartedAt)],
                              ]
                            : []),
                        ...(data.packedAt
                            ? [
                                  ["Người đóng gói (ID)", data.packedBy],
                                  ["Đóng gói lúc", dateTime(data.packedAt)],
                                  [
                                      "Bao bì",
                                      data.packagingType === "CARTON" ? "Thùng carton" : "Túi PE",
                                  ],
                              ]
                            : []),
                        ...(data.exportedAt
                            ? [
                                  ["Người xuất (ID)", data.exportedBy],
                                  ["Xuất kho lúc", dateTime(data.exportedAt)],
                                  ["Đơn vị vận chuyển", display(data.carrierName)],
                                  ["Mã vận đơn", display(data.trackingNumber)],
                              ]
                            : []),
                        ...(data.note ? [["Ghi chú", data.note]] : []),
                        ...(data.status === "CANCELLED"
                            ? [
                                  ["Người hủy (ID)", data.cancelledBy],
                                  ["Hủy lúc", dateTime(data.cancelledAt)],
                                  ["Lý do hủy", display(data.cancellationReason)],
                              ]
                            : []),
                    ]}
                />
            </section>
            {!openOrder && !["EXPORTED", "CANCELLED"].includes(data.status) && (
                <Alert variant="warning">
                    Trạng thái đơn hàng hiện tại không cho phép tiếp tục xử lý phiếu xuất.
                </Alert>
            )}
            {openOrder && data.assignedTo && !ownsIssue && <Alert variant="info">
                Phiếu đang do nhân viên khác phụ trách. Bạn có thể xem tiến độ xử lý.
            </Alert>}
            {data.status === "PICKING" && openOrder && ownsIssue ? (
                <ActionForm
                    {...common}
                    action="picking"
                    schema={pickingSchema(data)}
                    defaultValues={{
                        version: data.version,
                        items: data.items.map((item) => ({
                            issueItemId: item.issueItemId,
                            pickedQuantity: item.pickedQuantity,
                        })),
                    }}
                    title="Lưu số lượng đã soạn"
                    description="Có thể lưu tiến độ. Chỉ đóng gói sau khi đã lưu đủ số lượng của tất cả các dòng."
                >
                    {lines(true)}
                </ActionForm>
            ) : (
                lines()
            )}
            {data.status === "PENDING" && openOrder && (
                <ActionForm
                    {...common}
                    action="start"
                    schema={issueVersionSchema}
                    defaultValues={{ version: data.version }}
                    title="Bắt đầu soạn hàng"
                    confirmText="Nhận soạn toàn bộ phiếu xuất này?"
                />
            )}
            {data.status === "PICKING" && openOrder && ownsIssue && (
                <ActionForm
                    {...common}
                    disabled={actions.disabled || !fullyPicked}
                    action="pack"
                    schema={packIssueSchema}
                    defaultValues={{ version: data.version, packagingType: "" }}
                    title="Xác nhận đóng gói"
                    description={
                        fullyPicked
                            ? "Đã lưu đủ hàng. Chọn bao bì trước khi đóng gói."
                            : "Chưa lưu đủ số lượng soạn. Hoàn tất và lưu các dòng hàng ở trên trước."
                    }
                    confirmText="Xác nhận đã đóng gói đầy đủ các mặt hàng?"
                >
                    <InputField
                        name="packagingType"
                        label="Loại bao bì *"
                        options={[
                            ["", "Chọn bao bì"],
                            ["CARTON", "Thùng carton"],
                            ["PE_BAG", "Túi PE"],
                        ]}
                    />
                </ActionForm>
            )}
            {data.status === "PACKED" && data.orderStatus === "PACKED" && fullyPicked && ownsIssue && (
                <ActionForm
                    {...common}
                    action="export"
                    schema={exportIssueSchema}
                    defaultValues={{
                        version: data.version,
                        carrierName: "",
                        note: "",
                    }}
                    title="Xác nhận xuất kho"
                    description="Nhập đơn vị vận chuyển. Mã vận đơn được tự động cấp khi xác nhận xuất kho và trừ tồn."
                    confirmText="Xác nhận xuất toàn bộ phiếu, trừ tồn kho và chuyển đơn sang đang giao?"
                >
                    <InputField name="carrierName" label="Đơn vị vận chuyển *" maxLength={255} />
                    <InputField
                        name="note"
                        label="Ghi chú xuất kho"
                        as="textarea"
                        rows={3}
                        maxLength={1000}
                    />
                </ActionForm>
            )}
            {openOrder && (!data.assignedTo || ownsIssue) && ["PENDING", "PICKING", "PACKED"].includes(data.status) && (
                <ActionForm
                    {...common}
                    action="cancel"
                    schema={cancelIssueSchema}
                    defaultValues={{ version: data.version, reason: "", stockRecovered: false }}
                    title="Hủy phiếu xuất"
                    danger
                    description="Đơn hàng sẽ chuyển sang đã hủy kèm lý do của Warehouse. Không thể tạo lại phiếu. Tồn vật lý không thay đổi; lượng giữ hàng được giải phóng."
                    confirmText="Hủy phiếu xuất và đơn hàng vĩnh viễn? Không thể tạo lại phiếu."
                >
                    <InputField name="stockRecovered" type="checkbox"
                        label="Đã kiểm tra và thu hồi đầy đủ hàng của phiếu (nếu đã soạn/đóng gói)" />
                    <InputField
                        name="reason"
                        label="Lý do hủy *"
                        as="textarea"
                        rows={3}
                        maxLength={1000}
                    />
                </ActionForm>
            )}
        </>
    );
}
export default function GoodsIssueDetailPage() {
    const { issueId } = useParams();
    return (
        <WarehouseDetail key={issueId} resource="issue" id={issueId}>
            {(props) => <IssueContent {...props} />}
        </WarehouseDetail>
    );
}
