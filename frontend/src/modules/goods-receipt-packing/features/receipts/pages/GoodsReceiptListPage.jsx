import "../../../../../shared/styles/warehouse.css";
import useAuth from "../../../../auth/hooks/useAuth.js";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useReceipts } from "../queries/receipt.queries.js";
import { useWarehouseList } from "../../../../../shared/hooks/useWarehouseList.js";
import { receiptFilterSchema } from "../schemas/receipt.schemas.js";
import WarehouseFilters from "../../../../../shared/components/WarehouseFilters.jsx";
import {
    DataTable,
    PageHeading,
    PaginationBar,
    QueryState,
    StatusBadge,
} from "../../../../../shared/components/WarehouseUI.jsx";
import { dateTime } from "../../../../../shared/utils/warehouse.format.js";

export default function GoodsReceiptListPage({ pendingOnly = false }) {
    const { user } = useAuth();
    const canCreate = user?.role === "STORE_STAFF";
    const basePath = canCreate ? "/store-staff/goods-receipts" : "/warehouse-staff/goods-receipts";
    const { params, change } = useWarehouseList({ keyword: "", status: "" });
    const filters = { ...params, status: pendingOnly ? "PENDING" : params.status };
    const query = useReceipts(filters);
    return (
        <div className="goods-receipt-packing">
            <PageHeading
                title={pendingOnly ? "Phiếu nhập chờ xử lý" : "Phiếu nhập kho"}
                description={canCreate
                    ? "Tạo phiếu nhập và theo dõi kết quả xác nhận từ Warehouse. Có thể hủy phiếu còn chờ xử lý."
                    : "Kiểm tra phiếu nhập và xác nhận số lượng thực nhận để cập nhật tồn kho."}
            >
                {canCreate && <Button
                    as={Link}
                    to={`${basePath}/new`}
                    className="btn-primary-navy"
                >
                    Tạo phiếu nhập
                </Button>}
            </PageHeading>
            <WarehouseFilters
                key={JSON.stringify(filters)}
                schema={receiptFilterSchema}
                values={filters}
                onApply={change}
                fields={[
                    {
                        name: "keyword",
                        label: "Mã phiếu / Nhà cung cấp",
                        maxLength: 100,
                        placeholder: "Tìm phiếu nhập…",
                    },
                    ...(!pendingOnly
                        ? [
                              {
                                  name: "status",
                                  label: "Trạng thái",
                                  options: [
                                      ["", "Tất cả"],
                                      ["PENDING", "Chờ xử lý"],
                                      ["COMPLETED", "Đã nhập kho"],
                                      ["CANCELLED", "Đã hủy"],
                                  ],
                              },
                          ]
                        : []),
                ]}
            />
            <QueryState query={query}>
                <DataTable
                    headers={[
                        "Mã phiếu",
                        "Nhà cung cấp",
                        "Ngày tạo",
                        "Số lượng dự kiến",
                        "Trạng thái",
                        "Chi tiết",
                    ]}
                    empty={!query.data?.items.length}
                    emptyTitle="Không có phiếu phù hợp"
                >
                    {query.data?.items.map((item) => (
                        <tr key={item.goodsReceiptId}>
                            <td>{item.code}</td>
                            <td>{item.supplierName}</td>
                            <td>{dateTime(item.createdAt)}</td>
                            <td>{item.expectedQuantity}</td>
                            <td>
                                <StatusBadge status={item.goodsReceiptStatus} />
                            </td>
                            <td>
                                <Link
                                    to={`${basePath}/${item.goodsReceiptId}`}
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
