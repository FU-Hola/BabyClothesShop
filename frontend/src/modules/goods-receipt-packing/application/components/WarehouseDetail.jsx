import { useState } from "react";
import { Alert, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useIsMutating } from "@tanstack/react-query";
import { useWarehouseDetail } from "../query/warehouse.queries.js";
import { idSchema } from "../../../../shared/schemas/warehouse.schemas.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";

export default function WarehouseDetail({ resource, id, children, listPath }) {
    const query = useWarehouseDetail(resource, id);
    const writing = useIsMutating({ mutationKey: warehouseKeys.write(resource, id) }) > 0;
    const [saved, setSaved] = useState(false);
    const list = listPath || `/warehouse-staff/${resource === "receipt" ? "goods-receipts" : "issues"}`;
    if (!idSchema.safeParse(id).success)
        return <Alert variant="danger">Đường dẫn phiếu không hợp lệ. <Link to={list}>Về danh sách</Link></Alert>;
    if (query.isPending)
        return <p role="status"><Spinner as="span" size="sm" /> Đang tải phiếu…</p>;

    return (
        <div className="goods-receipt-packing">
            <div className="d-flex justify-content-between gap-3 mb-3">
                <Link to={list}>← Danh sách phiếu</Link>
                <Button variant="outline-secondary" disabled={writing || query.isFetching}
                    onClick={() => query.refetch()}>
                    Tải lại phiếu
                </Button>
            </div>
            {saved && <Alert variant="success">Thao tác thành công.</Alert>}
            {query.isError && <Alert variant="danger">{query.error.message} Vui lòng tải lại phiếu.</Alert>}
            {query.data && (
                <div key={`${id}:${query.dataUpdatedAt}`}>
                    {children({
                        data: query.data,
                        disabled: writing || query.isFetching || query.isError,
                        onCompleted: () => setSaved(true),
                    })}
                </div>
            )}
        </div>
    );
}
