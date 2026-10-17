import { Table, Image } from "react-bootstrap";

const StockTable = ({ stockItems }) => {
    if (stockItems.length === 0) {
        return <p className="text-center text-muted py-5 mb-0">Không tìm thấy dữ liệu tồn kho phù hợp.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="table-light">
                    <tr>
                        <th>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Mã SKU</th>
                        <th>Size</th>
                        <th>Danh mục</th>
                        <th className="text-end">Tồn thực tế</th>
                        <th className="text-end">Đang giữ</th>
                        <th className="text-end">Có thể bán</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    {stockItems.map((item) => (
                        <tr key={item.id}>
                            <td>
                                <Image src="/images/products/sample-baby-romper.png" alt={item.productName} width={52} height={52} />
                            </td>
                            <td>{item.productName}</td>
                            <td><span className="badge bg-primary-subtle text-primary">{item.sku}</span></td>
                            <td>{item.size}</td>
                            <td>{item.category}</td>
                            <td className="text-end">{item.physicalStock}</td>
                            <td className="text-end">{item.reservedStock}</td>
                            <td className="text-end">{item.availableStock}</td>
                            <td className={item.availableStock > 0 ? "text-success" : "text-danger"}>
                                {item.availableStock > 0 ? "Còn hàng" : "Hết hàng"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default StockTable;
