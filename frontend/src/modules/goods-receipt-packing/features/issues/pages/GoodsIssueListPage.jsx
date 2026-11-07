import { Link } from "react-router-dom";
import { useIssues } from "../queries/issue.queries.js";
import { useWarehouseList } from "../../../../../shared/hooks/useWarehouseList.js";
import { issueFilterSchema } from "../schemas/issue.schemas.js";
import WarehouseFilters from "../../../../../shared/components/WarehouseFilters.jsx";
import {
    DataTable,
    PageHeading,
    PaginationBar,
    QueryState,
    StatusBadge,
} from "../../../../../shared/components/WarehouseUI.jsx";
import { dateTime } from "../../../../../shared/utils/warehouse.format.js";
export default function GoodsIssueListPage() {
    const { params, change } = useWarehouseList({ keyword: "", status: "", orderId: "" });
    const query = useIssues(params);
    return (
        <div className="goods-receipt-packing">
            <PageHeading
                title="Phiếu xuất kho"
                description="Phiếu xuất được tạo từ đơn hàng. Soạn hàng, đóng gói và xác nhận xuất kho tại đây."
            />
            <WarehouseFilters
                key={JSON.stringify(params)}
                schema={issueFilterSchema}
                values={params}
                onApply={change}
                fields={[
                    {
                        name: "keyword",
                        label: "Mã phiếu / Mã đơn hàng",
                        maxLength: 100,
                        placeholder: "Tìm phiếu xuất…",
                    },
                    {
                        name: "status",
                        label: "Trạng thái",
                        options: [
                            ["", "Tất cả"],
                            ["PENDING", "Chờ xử lý"],
                            ["PICKING", "Đang soạn hàng"],
                            ["PACKED", "Đã đóng gói"],
                            ["EXPORTED", "Đã xuất kho"],
                            ["CANCELLED", "Đã hủy"],
                        ],
                    },
                    ...(params.orderId ? [{ name: "orderId", label: "ID đơn hàng" }] : []),
                ]}
            />
            <QueryState query={query}>
                <DataTable
                    headers={["Mã phiếu", "Đơn hàng", "Ngày tạo", "Trạng thái", "Chi tiết"]}
                    empty={!query.data?.items.length}
                    emptyTitle="Không có phiếu phù hợp"
                >
                    {query.data?.items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.code}</td>
                            <td>{item.orderCode}</td>
                            <td>{dateTime(item.createdAt)}</td>
                            <td>
                                <StatusBadge status={item.status} />
                            </td>
                            <td>
                                <Link
                                    to={`/warehouse-staff/issues/${item.id}`}
                                    aria-label={`Xem phiếu ${item.code}`}
                                >
                                    Xem phiếu
                                </Link>
                            </td>
                        </tr>
                    ))}
                </DataTable>
                <PaginationBar data={query.data} busy={query.isFetching} onChange={change} />
            </QueryState>
        </div>
    );
}
