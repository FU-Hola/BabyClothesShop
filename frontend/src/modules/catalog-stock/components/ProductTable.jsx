import {Table, Button, Image} from "react-bootstrap";

const ProductTable = ({products, onEdit}) => {
    if (products.length === 0) {
        return <p className="text-center text-muted py-4">Không có sản phẩm phù hợp.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <Table hover className="align-middle mb-0">
                <thead className="table-light">
                <tr>
                    <th>Ảnh</th>
                    <th>Tên sản phẩm</th>
                    <th>Mã SKU</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                        <td>
                            <Image
                                src="/images/products/sample-baby-romper.png"
                                alt={`Ảnh mẫu ${product.name}`}
                                width={56}
                                height={56}
                                rounded
                                className="object-fit-contain"
                            />
                        </td>
                        <td>{product.name}</td>
                        <td>
                                <span className="badge bg-primary-subtle text-primary fw-semibold">
                                    {product.sku}
                                </span>
                        </td>
                        <td>{product.category}</td>
                        <td className="text-nowrap">{product.price} VND</td>
                        <td>
                                <span
                                    className={product.status === "ACTIVE" ? "text-success fw-medium" : "text-secondary fw-medium"}>
                                    {product.status === "ACTIVE" ? "Đang kinh doanh" : "Ngừng kinh doanh"}
                                </span>
                        </td>
                        <td className="text-nowrap">
                            {new Date(product.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td>
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="text-nowrap"
                                onClick={() => onEdit(product.id)}
                            >
                                Chỉnh sửa
                            </Button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default ProductTable;
