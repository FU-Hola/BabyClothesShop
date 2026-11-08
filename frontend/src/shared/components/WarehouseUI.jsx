import { Table, Button, Form, Alert, Spinner } from "react-bootstrap";
import { PackageOpen } from "lucide-react";
import NumberedPagination from "./NumberedPagination.jsx";
import "../styles/warehouse.css";

export function PageHeading({ title, description, children }) {
    return (
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
            <div>
                <p className="page-breadcrumb">Quản lý kho / {title}</p>
                <h1 className="page-title">{title}</h1>
                <p className="page-subtitle mb-0">{description}</p>
            </div>
            {children}
        </div>
    );
}

export function EmptyState({
    title = "Chưa có dữ liệu",
    description = "Dữ liệu sẽ được hiển thị tại đây khi có thông tin.",
}) {
    return (
        <div className="warehouse-empty">
            <PackageOpen size={36} aria-hidden="true" />
            <h2 className="h6 mt-3">{title}</h2>
            <p className="text-muted mb-0">{description}</p>
        </div>
    );
}

export function DataTable({ headers, children, empty, emptyTitle, emptyDescription }) {
    return (
        <div className="admin-card overflow-hidden mb-4">
            <div className="table-responsive">
                <Table className="admin-table">
                    <thead>
                        <tr>
                            {headers.map((label, index) => (
                                <th scope="col" key={`${label}-${index}`}>
                                    {label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {empty ? (
                            <tr>
                                <td colSpan={headers.length}>
                                    <EmptyState title={emptyTitle} description={emptyDescription} />
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}

export function StatusBadge({ status }) {
    const labels = {
        PENDING: "Chờ xử lý",
        PICKING: "Đang soạn hàng",
        PACKED: "Đã đóng gói",
        EXPORTED: "Đã xuất kho",
        COMPLETED: "Đã nhập kho",
        CANCELLED: "Đã hủy",
    };
    const tone = ["EXPORTED", "COMPLETED"].includes(status)
        ? "success"
        : status === "PENDING"
          ? "warning"
          : status === "CANCELLED"
            ? "neutral"
            : "info";
    return (
        <span className={`status-badge-dot status-badge-${tone}`}>
            {labels[status] ?? status ?? "Chưa có trạng thái"}
        </span>
    );
}

export function DetailFields({ fields }) {
    return (
        <dl className="warehouse-fields">
            {fields.map(([label, value]) => (
                <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value ?? "—"}</dd>
                </div>
            ))}
        </dl>
    );
}

export function QueryState({ query, children }) {
    if (query.isPending)
        return (
            <div role="status" className="p-5 text-center">
                <Spinner as="span" size="sm" className="me-2" />
                Đang tải dữ liệu…
            </div>
        );
    if (query.isError)
        return (
            <Alert variant="danger" role="alert">
                {query.error?.message || "Không thể tải dữ liệu."}
                {query.error?.requestId && (
                    <small className="d-block">Mã yêu cầu: {query.error.requestId}</small>
                )}
                <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-3"
                    onClick={() => query.refetch()}
                    disabled={query.isFetching}
                >
                    Thử lại
                </Button>
            </Alert>
        );
    return (
        <div aria-busy={query.isFetching}>
            {query.isFetching && (
                <p role="status" className="small text-muted">
                    Đang cập nhật dữ liệu…
                </p>
            )}
            {children}
        </div>
    );
}

export function PaginationBar({ data, busy, onChange }) {
    if (!data) return null;
    return (
        <nav
            aria-label="Phân trang"
            className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4"
        >
            <span className="text-muted small">
                {data.totalItems.toLocaleString("vi-VN")} bản ghi · Trang {data.page}/
                {Math.max(1, data.totalPages)}
            </span>
            <label className="d-flex align-items-center gap-2">
                Số dòng
                <Form.Select
                    aria-label="Số dòng mỗi trang"
                    value={data.size}
                    disabled={busy}
                    onChange={(event) => onChange({ page: 1, size: Number(event.target.value) })}
                    style={{ width: 90 }}
                >
                    {[...new Set([10, 20, 50, 100, data.size])]
                        .sort((a, b) => a - b)
                        .map((size) => (
                            <option key={size}>{size}</option>
                        ))}
                </Form.Select>
            </label>
            <NumberedPagination
                currentPage={data.page}
                totalPages={data.totalPages}
                busy={busy}
                onPageChange={(page) => onChange({ page })}
            />
        </nav>
    );
}
