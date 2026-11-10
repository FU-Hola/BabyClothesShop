import { Table } from "react-bootstrap";

const StockTable = ({ stockItems }) => {
    if (stockItems.length === 0) {
        return <p className="text-center text-muted py-5 mb-0">Không tìm thấy dữ liệu tồn kho phù hợp.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Tên sản phẩm</th>
                        <th>Mã SKU</th>
                        <th>Màu</th>
                        <th>Size</th>
                        <th>Danh mục</th>
                        <th className="text-end">Tồn vật lý</th>
                        <th className="text-end">Đang giữ</th>
                        <th className="text-end">Có thể bán</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {stockItems.map((item) => (
                        <tr key={item.variantId}>
                            <td>{item.productName}</td>
                            <td><span className="badge bg-primary-subtle text-primary">{item.sku}</span></td>
                            <td>{item.color}</td>
                            <td>{item.size}</td>
                            <td>{item.categoryName}</td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">{item.reservedQuantity}</td>
                            <td className="text-end">{item.availableQuantity}</td>
                            <td className={item.stockStatus === "IN_STOCK" ? "text-success" : "text-danger"}>
                                {item.stockStatus === "IN_STOCK" ? "Còn hàng" : "Hết hàng"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default StockTable;
