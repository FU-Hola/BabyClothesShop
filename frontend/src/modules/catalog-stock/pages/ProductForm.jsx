import { Container, Button, Image, Form, Row, Col } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import mockProducts from "../api/mockProducts.js";
import { useState } from "react";

const ProductForm = () => {
    const { productId } = useParams();
    const isEditMode = productId !== undefined;
    const product = isEditMode
        ? mockProducts.find((item) => item.id === Number(productId))
        : null;

    const [name, setName] = useState(product ? product.name : "");
    const [description, setDescription] = useState(product ? product.description : "");
    const [category, setCategory] = useState(product ? product.category : "");
    const [sku, setSku] = useState(product ? product.sku : "");
    const [color, setColor] = useState(product ? product.color : "");
    const [price, setPrice] = useState(product ? String(product.price) : "");
    const [originalPrice, setOriginalPrice] = useState(
        product && product.originalPrice !== null ? String(product.originalPrice) : ""
    );
    const [status, setStatus] = useState(product ? product.status : "ACTIVE");
    const [errors, setErrors] = useState({});
    const [sizes, setSizes] = useState(product ? product.sizes : []);

    const handleSizeChange = (size) => {
        setSizes((previousSizes) => {
            if (previousSizes.includes(size)) {
                return previousSizes.filter((item) => item !== size);
            }
            return [...previousSizes, size];
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const newErrors = {};

        if (name.trim() === "") {
            newErrors.name = "Vui lòng nhập tên sản phẩm.";
        }
        if (description.trim() === "") {
            newErrors.description = "Vui lòng nhập mô tả sản phẩm.";
        }
        if (category === "") {
            newErrors.category = "Vui lòng chọn danh mục.";
        }
        if (sku.trim() === "") {
            newErrors.sku = "Vui lòng nhập SKU.";
        } else {
            const isDuplicateSku = mockProducts.some(
                (item) =>
                    item.sku.toLowerCase() === sku.trim().toLowerCase() &&
                    item.id !== Number(productId)
            );
            if (isDuplicateSku) {
                newErrors.sku = "SKU đã được sử dụng bởi sản phẩm khác.";
            }
        }
        if (color.trim() === "") {
            newErrors.color = "Vui lòng nhập màu sắc.";
        }
        if (price.trim() === "") {
            newErrors.price = "Vui lòng nhập giá bán.";
        } else if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
            newErrors.price = "Giá bán phải là số hợp lệ lớn hơn 0.";
        }
        if (originalPrice.trim() !== "") {
            if (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) <= 0) {
                newErrors.originalPrice = "Giá trước giảm phải là số hợp lệ lớn hơn 0.";
            } else if (!newErrors.price && Number(originalPrice) <= Number(price)) {
                newErrors.originalPrice = "Giá trước giảm phải lớn hơn giá bán.";
            }
        }
        if (sizes.length === 0) {
            newErrors.sizes = "Vui lòng chọn ít nhất một size.";
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            return;
        }

        const productData = {
            name: name.trim(),
            description: description.trim(),
            category: category,
            sku: sku.trim(),
            color: color.trim(),
            price: Number(price),
            originalPrice: originalPrice.trim() === "" ? null : Number(originalPrice),
            status: isEditMode ? status : "ACTIVE",
            sizes: sizes,
            images: []
        };

        if (isEditMode) {
            console.log("Dữ liệu chỉnh sửa, chưa lưu:", productId, productData);
        } else {
            console.log("Dữ liệu tạo mới, chưa lưu:", productData);
        }
    };

    if (isEditMode && !product) {
        return (
            <Container fluid className="py-4 px-0">
                <div className="bg-white rounded-4 shadow-sm p-4 text-center">
                    <p className="text-muted mb-3">Không tìm thấy sản phẩm.</p>
                    <Button as={Link} to="/store-staff/products" variant="outline-secondary">
                        Quay lại danh sách
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-2 px-0">
            <p className="text-muted small mb-2">
                Quản trị / Quản lý sản phẩm / {isEditMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
            </p>
            <div className="mb-4">
                <h1 className="h3 fw-bold text-dark mb-1">
                    {isEditMode ? "Chỉnh sửa thông tin sản phẩm" : "Thêm sản phẩm"}
                </h1>
                {isEditMode && (
                    <p className="text-muted small mb-0">
                        Đang chỉnh sửa: <span className="fw-semibold text-dark">{product.name}</span> — SKU:{" "}
                        <span
                            className="badge fw-semibold px-2 py-1 rounded"
                            style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                        >
                            {product.sku}
                        </span>
                    </p>
                )}
            </div>
            <div className="bg-white rounded-4 shadow-sm p-4 mb-4">
                <Form onSubmit={handleSubmit} noValidate>
                    <Form.Group className="mb-4" controlId="productName">
                        <Form.Label className="fw-semibold text-dark">Tên sản phẩm</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nhập tên sản phẩm"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            isInvalid={Boolean(errors.name)}
                            className="bg-light"
                        />
                        <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="productDescription">
                        <Form.Label className="fw-semibold text-dark">Mô tả sản phẩm</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Nhập mô tả sản phẩm"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            isInvalid={Boolean(errors.description)}
                            className="bg-light"
                        />
                        <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                    </Form.Group>
                    <Row className="g-3 mb-4">
                        <Col xs={6}>
                            <Form.Group controlId="productCategory">
                                <Form.Label className="fw-semibold text-dark">Danh mục</Form.Label>
                                <Form.Select
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    isInvalid={Boolean(errors.category)}
                                    className="bg-light"
                                >
                                    <option value="">Chọn danh mục</option>
                                    <option value="Quần áo sơ sinh">Quần áo sơ sinh</option>
                                    <option value="Thời trang bé gái">Thời trang bé gái</option>
                                    <option value="Thời trang bé trai">Thời trang bé trai</option>
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={6}>
                            <Form.Group controlId="productSku">
                                <Form.Label className="fw-semibold text-dark">Mã SKU</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ví dụ: BABY006"
                                    value={sku}
                                    onChange={(event) => setSku(event.target.value)}
                                    isInvalid={Boolean(errors.sku)}
                                    className="bg-light"
                                />
                                <Form.Control.Feedback type="invalid">{errors.sku}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="g-3 mb-4">
                        <Col xs={4}>
                            <Form.Group controlId="productColor">
                                <Form.Label className="fw-semibold text-dark">Màu sắc</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Ví dụ: Trắng"
                                    value={color}
                                    onChange={(event) => setColor(event.target.value)}
                                    isInvalid={Boolean(errors.color)}
                                    className="bg-light"
                                />
                                <Form.Control.Feedback type="invalid">{errors.color}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={4}>
                            <Form.Group controlId="productPrice">
                                <Form.Label className="fw-semibold text-dark">Giá bán (VND)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="1000"
                                    placeholder="Nhập giá bán"
                                    value={price}
                                    onChange={(event) => setPrice(event.target.value)}
                                    isInvalid={Boolean(errors.price)}
                                    className="bg-light"
                                />
                                <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={4}>
                            <Form.Group controlId="productOriginalPrice">
                                <Form.Label className="fw-semibold text-dark">Giá trước giảm (VND)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    step="1000"
                                    placeholder="Nhập giá trước giảm"
                                    value={originalPrice}
                                    onChange={(event) => setOriginalPrice(event.target.value)}
                                    isInvalid={Boolean(errors.originalPrice)}
                                    className="bg-light"
                                />
                                <Form.Control.Feedback type="invalid">{errors.originalPrice}</Form.Control.Feedback>
                                <Form.Text className="text-muted">
                                    Để trống nếu sản phẩm không giảm giá.
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    {isEditMode && (
                        <Form.Group className="mb-4" controlId="productStatus">
                            <Form.Label className="fw-semibold text-dark">Trạng thái kinh doanh</Form.Label>
                            <Form.Select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                className="bg-light w-50"
                            >
                                <option value="ACTIVE">Đang kinh doanh</option>
                                <option value="INACTIVE">Ngừng kinh doanh</option>
                            </Form.Select>
                        </Form.Group>
                    )}
                    <fieldset className="mb-4">
                        <legend className="fs-6 fw-semibold text-dark mb-2">Kích cỡ</legend>
                        <div className="d-flex gap-3">
                            {["S", "M", "L"].map((size) => (
                                <Form.Check
                                    key={size}
                                    type="checkbox"
                                    id={`product-size-${size}`}
                                    label={size}
                                    checked={sizes.includes(size)}
                                    onChange={() => handleSizeChange(size)}
                                    isInvalid={Boolean(errors.sizes)}
                                    className="fw-medium text-dark"
                                />
                            ))}
                        </div>
                        {errors.sizes && (
                            <p className="text-danger small mt-1 mb-0">{errors.sizes}</p>
                        )}
                    </fieldset>
                    <section className="mb-4 pt-3 border-top border-light-subtle">
                        <h2 className="h6 fw-semibold text-dark mb-2">Ảnh sản phẩm</h2>
                        <div
                            className="p-3 rounded-3 d-inline-block border border-light-subtle"
                            style={{ backgroundColor: "#f8fafc" }}
                        >
                            <Image
                                src="/images/products/sample-baby-romper.png"
                                alt="Ảnh mẫu sản phẩm"
                                width={180}
                                height={180}
                                rounded
                                className="object-fit-contain"
                            />
                        </div>
                    </section>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top border-light-subtle">
                        <Button
                            as={Link}
                            to="/store-staff/products"
                            variant="outline-secondary"
                            className="px-3 py-2 rounded-3"
                        >
                            Quay lại danh sách
                        </Button>
                        <Button
                            type="submit"
                            variant="dark"
                            className="px-4 py-2 rounded-3 border-0 text-white shadow-sm"
                            style={{ backgroundColor: "#10152B" }}
                        >
                            {isEditMode ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default ProductForm;
