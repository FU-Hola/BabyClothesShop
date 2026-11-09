import { useState } from "react";
import { Alert, Button, Modal, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";
import { useWarehouseDetail } from "../query/warehouse.queries.js";
import { uuidSchema } from "../../../../shared/schemas/warehouse.schemas.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";

export default function WarehouseDetail({ resource, id, children, listPath }) {
    const query = useWarehouseDetail(resource, id);
    const writing = useIsMutating({ mutationKey: warehouseKeys.write(resource, id) }) > 0;
    const [uncertain, setUncertain] = useState(false);
    const [refreshPrompt, setRefreshPrompt] = useState(false);
    const [notice, setNotice] = useState(null);
    const [revision, setRevision] = useState(0);
    const list = listPath || `/warehouse-staff/${resource === "receipt" ? "goods-receipts" : "issues"}`;
    async function refresh() {
        const result = await query.refetch();
        if (!result.isError) {
            setUncertain(false);
            setRevision((value) => value + 1);
            setRefreshPrompt(false);
            setNotice(null);
        }
    }
    if (!uuidSchema.safeParse(id).success)
        return (
            <Alert variant="danger">
                Đường dẫn phiếu không hợp lệ.{" "}
                <Link to={list}>Về danh sách</Link>
            </Alert>
        );
    if (query.isPending)
        return (
            <p role="status">
                <Spinner as="span" size="sm" /> Đang tải phiếu…
            </p>
        );
    return (
        <div className="goods-receipt-packing">
            <div className="d-flex justify-content-between gap-3 mb-3">
                <Link to={list}>← Danh sách phiếu</Link>
                <Button
                    variant="outline-secondary"
                    disabled={writing || query.isFetching}
                    onClick={() => setRefreshPrompt(true)}
                >
                    Tải lại phiếu
                </Button>
            </div>
            {query.isError && (
                <Alert variant="danger">
                    {query.error.message}{" "}
                    {query.error.requestId && <small>Mã yêu cầu: {query.error.requestId}</small>} Dữ
                    liệu cũ chỉ được xem; hãy tải lại phiếu.
                </Alert>
            )}
            {notice && (
                <Alert variant={notice.refreshFailed ? "warning" : "success"} role="status">
                    Thao tác thành công.
                    {notice.refreshFailed &&
                        " Không tải lại được một số dữ liệu. Vui lòng tải lại trước khi thao tác tiếp."}
                    {notice.data?.id && notice.data.id !== id && (
                        <Link className="ms-2" to={`/warehouse-staff/issues/${notice.data.id}`}>
                            Mở phiếu xuất hiện tại
                        </Link>
                    )}
                </Alert>
            )}
            {uncertain && (
                <Alert variant="warning">
                    Phiếu có thể đã thay đổi. Kiểm tra trạng thái bằng nút “Tải lại phiếu” trước khi
                    tiếp tục.
                </Alert>
            )}
            {query.data && (
                <div key={`${id}:${query.data.version}:${revision}`}>
                    {children({
                        data: query.data,
                        disabled:
                            writing ||
                            query.isFetching ||
                            query.isError ||
                            uncertain ||
                            notice?.refreshFailed,
                        onCompleted: setNotice,
                        onUncertain: () => setUncertain(true),
                    })}
                </div>
            )}
            <Modal
                show={refreshPrompt}
                onHide={() => {
                    if (!query.isFetching) setRefreshPrompt(false);
                }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton={!query.isFetching}>
                    <Modal.Title>Tải lại phiếu</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Dữ liệu chưa lưu sẽ được thay bằng trạng thái mới nhất từ máy chủ.
                    {query.isError && (
                        <Alert variant="danger" className="mt-3">
                            {query.error.message}
                        </Alert>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        disabled={query.isFetching}
                        onClick={() => setRefreshPrompt(false)}
                    >
                        Quay lại
                    </Button>
                    <Button disabled={query.isFetching} onClick={refresh}>
                        {query.isFetching ? "Đang tải…" : "Tải lại"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
