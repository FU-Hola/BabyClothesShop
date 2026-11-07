import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useReceiptProducts, useReceiptVariants } from "../queries/receipt.queries.js";
import { DataTable, PaginationBar, QueryState } from "../../../../../shared/components/WarehouseUI.jsx";
import { display } from "../../../../../shared/utils/warehouse.format.js";

export default function ReceiptProductPicker({ existingIds, onAdd, onClose }) {
    const [keyword, setKeyword] = useState("");
    const [params, setParams] = useState({ keyword: "", page: 1, size: 10 });
    const [product, setProduct] = useState(null);
    const [selected, setSelected] = useState([]);
    const products = useReceiptProducts(params);
    const variants = useReceiptVariants(product?.productId);
    const remaining = 200 - existingIds.length;
    return (
        <Modal
            show
            onHide={onClose}
            size="lg"
            centered
            scrollable
            className="goods-receipt-packing"
        >
            <Modal.Header closeButton>
                <Modal.Title>Chọn hàng nhập kho</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="text-muted">
                    Chỉ hiển thị sản phẩm và biến thể đang hoạt động, đã có trong kho. SKU có tồn
                    bằng 0 vẫn nhập được.
                </p>
                {!product ? (
                    <>
                        <Form.Label htmlFor="receipt-product-search">Tên sản phẩm</Form.Label>
                        <div className="d-flex gap-2 mb-3">
                            <Form.Control
                                id="receipt-product-search"
                                value={keyword}
                                maxLength={100}
                                onChange={(event) => setKeyword(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        setParams({ ...params, keyword: keyword.trim(), page: 1 });
                                    }
                                }}
                            />
                            <Button
                                onClick={() =>
                                    setParams({ ...params, keyword: keyword.trim(), page: 1 })
                                }
                            >
                                Tìm
                            </Button>
                        </div>
                        <QueryState query={products}>
                            <DataTable
                                headers={["Sản phẩm", "Danh mục", "Chọn"]}
                                empty={!products.data?.items.length}
                                emptyTitle="Không có sản phẩm đủ điều kiện"
                            >
                                {products.data?.items.map((item) => (
                                    <tr key={item.productId}>
                                        <td>{item.productName}</td>
                                        <td>{display(item.categoryName)}</td>
                                        <td>
                                            <Button
                                                variant="outline-primary"
                                                disabled={products.isFetching}
                                                onClick={() => {
                                                    setProduct(item);
                                                    setSelected([]);
                                                }}
                                                aria-label={`Chọn ${item.productName}`}
                                            >
                                                Chọn SKU
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </DataTable>
                            <PaginationBar
                                data={products.data}
                                busy={products.isFetching}
                                onChange={(values) => setParams({ ...params, ...values })}
                            />
                        </QueryState>
                    </>
                ) : (
                    <>
                        <Button variant="link" onClick={() => setProduct(null)}>
                            ← Chọn sản phẩm khác
                        </Button>
                        <h2 className="h5 mt-2">{product.productName}</h2>
                        <QueryState query={variants}>
                            <DataTable
                                headers={["Chọn", "SKU", "Màu", "Kích thước", "Tồn"]}
                                empty={!variants.data?.length}
                                emptyTitle="Sản phẩm không còn SKU đủ điều kiện"
                            >
                                {variants.data?.map((item) => (
                                    <tr key={item.variantId}>
                                        <td>
                                            <Form.Check
                                                aria-label={`Chọn SKU ${item.sku}`}
                                                checked={
                                                    selected.includes(item.variantId) ||
                                                    existingIds.includes(item.variantId)
                                                }
                                                disabled={
                                                    variants.isFetching ||
                                                    existingIds.includes(item.variantId) ||
                                                    (!selected.includes(item.variantId) &&
                                                        selected.length >= remaining)
                                                }
                                                onChange={(event) =>
                                                    setSelected(
                                                        event.target.checked
                                                            ? [...selected, item.variantId]
                                                            : selected.filter(
                                                                  (id) => id !== item.variantId,
                                                              ),
                                                    )
                                                }
                                            />
                                            {existingIds.includes(item.variantId) && (
                                                <small>Đã thêm</small>
                                            )}
                                        </td>
                                        <td>{item.sku}</td>
                                        <td>{display(item.color)}</td>
                                        <td>{display(item.size)}</td>
                                        <td>{item.quantity}</td>
                                    </tr>
                                ))}
                            </DataTable>
                        </QueryState>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <span className="me-auto small text-muted">
                    Đã chọn {selected.length} · Còn tối đa {remaining} dòng
                </span>
                <Button variant="outline-secondary" onClick={onClose}>
                    Đóng
                </Button>
                {product && (
                    <Button
                        disabled={!selected.length || variants.isFetching || variants.isError}
                        onClick={() => {
                            onAdd(
                                variants.data
                                    .filter((item) => selected.includes(item.variantId))
                                    .map((item) => ({
                                        ...item,
                                        productName: product.productName,
                                        expectedQuantity: 1,
                                    })),
                            );
                            onClose();
                        }}
                    >
                        Thêm vào phiếu
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
}
