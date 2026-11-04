import { useInventory, useInventoryStatistics } from "../query/warehouse.queries.js";
import { useWarehouseList } from "../hooks/useWarehouseList.js";
import { inventoryFilterSchema } from "../schema/warehouse.schemas.js";
import WarehouseFilters from "../components/WarehouseFilters.jsx";
import { DataTable, PageHeading, PaginationBar, QueryState } from "../components/WarehouseUI.jsx";
import { display } from "../utils/warehouse.format.js";
export default function InventoryPage() {
    const { params, change } = useWarehouseList({
        keyword: "",
        variantSize: "",
        productStatus: "",
        categoryId: "",
    });
    const query = useInventory(params);
    const statistics = useInventoryStatistics();
    return (
        <div className="goods-receipt-packing">
            <PageHeading
                title="Tồn kho"
                description="Theo dõi số lượng tồn theo từng SKU. Tồn kho thay đổi khi xác nhận nhập hoặc xuất kho."
            />
            <QueryState query={statistics}>
                <div className="row g-3 mb-2">
                    {[
                        ["Tổng số lượng tồn", statistics.data?.totalAvailableQuantity],
                        ["SKU còn hàng", statistics.data?.inStockVariantCount],
                        ["SKU hết hàng", statistics.data?.outOfStockVariantCount],
                    ].map(([label, value]) => (
                        <div className="col-md-4" key={label}>
                            <div className="stat-card">
                                <div>
                                    <div className="stat-label">{label}</div>
                                    <div className="stat-value">
                                        {value?.toLocaleString("vi-VN")}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="small text-muted mb-4">
                    Thống kê toàn kho cho sản phẩm đang hoạt động, không thay đổi theo bộ lọc.
                </p>
            </QueryState>
            <WarehouseFilters
                key={JSON.stringify(params)}
                schema={inventoryFilterSchema}
                values={params}
                onApply={change}
                fields={[
                    {
                        name: "keyword",
                        label: "Sản phẩm / SKU",
                        maxLength: 100,
                        placeholder: "Tìm trong kho…",
                    },
                    { name: "variantSize", label: "Kích thước", maxLength: 40 },
                    {
                        name: "productStatus",
                        label: "Trạng thái sản phẩm",
                        options: [
                            ["", "Tất cả"],
                            ["ACTIVE", "Đang hoạt động"],
                            ["INACTIVE", "Ngừng hoạt động"],
                        ],
                    },
                ]}
            />
            {params.categoryId && (
                <button
                    className="btn btn-outline-secondary mb-3"
                    onClick={() => change({ categoryId: "", page: 1 })}
                >
                    Bỏ lọc danh mục hiện tại
                </button>
            )}
            <QueryState query={query}>
                <DataTable
                    headers={[
                        "SKU",
                        "Sản phẩm",
                        "Danh mục",
                        "Kích thước",
                        "Tồn kho",
                        "Trạng thái sản phẩm",
                        "Trạng thái SKU",
                    ]}
                    empty={!query.data?.items.length}
                    emptyTitle="Không có hàng phù hợp"
                >
                    {query.data?.items.map((item) => (
                        <tr key={item.variantId}>
                            <td>{item.sku}</td>
                            <td>{item.productName}</td>
                            <td>{display(item.categoryName)}</td>
                            <td>{display(item.size)}</td>
                            <td className="fw-semibold">{item.quantity.toLocaleString("vi-VN")}</td>
                            <td>
                                {item.productStatus === "ACTIVE"
                                    ? "Đang hoạt động"
                                    : "Ngừng hoạt động"}
                            </td>
                            <td>{item.variantActive ? "Đang hoạt động" : "Ngừng hoạt động"}</td>
                        </tr>
                    ))}
                </DataTable>
                <PaginationBar data={query.data} busy={query.isFetching} onChange={change} />
            </QueryState>
        </div>
    );
}
