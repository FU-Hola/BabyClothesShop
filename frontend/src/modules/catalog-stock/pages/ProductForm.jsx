import { useEffect, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

import ProductImages from "../components/ProductImages.jsx";
import { catalogError, createProduct, getCategories, getProduct, updateProduct } from "../api/catalog-stock.api.js";

const listPath = "/store-staff/products";
const newVariant = () => ({
    key: crypto.randomUUID(),
    sku: "",
    color: "",
    size: "",
    price: "",
    originalPrice: "",
    active: true,
});

function ProductEditor({ productId, onSaved }) {
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [savedVariants, setSavedVariants] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showInactive, setShowInactive] = useState(false);
    const hiddenIds = new Set(savedVariants.filter((variant) => !variant.active).map((variant) => variant.id));

    useEffect(() => {
        let cancelled = false;
        Promise.all([getCategories(), productId ? getProduct(productId) : Promise.resolve(null)])
            .then(([categoryData, detail]) => {
                if (cancelled) return;
                setCategories(categoryData);
                setSavedVariants(detail?.variants ?? []);
                setProduct(detail ? {
                    ...detail,
                    variants: detail.variants.map((variant) => ({
                        ...variant,
                        key: variant.id,
                        originalPrice: variant.originalPrice ?? "",
                    })),
                } : {
                    name: "", description: "", categoryId: "", status: "ACTIVE",
                    variants: [newVariant()],
                });
            })
            .catch((failure) => { if (!cancelled) setLoadError(catalogError(failure)); });

        return () => { cancelled = true; };
    }, [productId]);

    function setField(field, value) {
        setProduct((previous) => ({ ...previous, [field]: value }));
    }

    function setVariantField(key, field, value) {
        setProduct((previous) => ({
            ...previous,
            variants: previous.variants.map((variant) =>
                variant.key === key ? { ...variant, [field]: value } : variant
            ),
        }));
    }

    async function submit(event) {
        event.preventDefault();
        setSaving(true);
        setSubmitError("");
        setFieldErrors({});
        try {
            const payload = {
                name: product.name.trim(),
                description: (product.description ?? "").trim(),
                categoryId: product.categoryId || null,
                variants: product.variants.map((variant) => ({
                    sku: variant.sku.trim(),
                    color: variant.color.trim(),
                    size: variant.size.trim(),
                    price: variant.price === "" ? null : Number(variant.price),
                    originalPrice: variant.originalPrice === "" ? null : Number(variant.originalPrice),
                    ...(productId ? { id: variant.id, active: variant.active } : {}),
                })),
                ...(productId ? { status: product.status, version: product.version } : {}),
            };

            if (productId) {
                await updateProduct(productId, payload);
                onSaved();
            } else {
                const savedId = await createProduct(payload);
                navigate(`${listPath}/${savedId}/edit`, {
                    replace: true,
                    state: { notice: "Đã tạo sản phẩm. Bạn có thể tải ảnh lên bên dưới." },
                });
            }
        } catch (failure) {
            const responseErrors = failure.response?.data?.errors;
            const errors = typeof responseErrors === "object" && responseErrors !== null ? responseErrors : {};
            setFieldErrors(errors);
            setSubmitError(Object.keys(errors).length > 0
                ? "Vui lòng kiểm tra lại các ô được đánh dấu đỏ."
                : catalogError(failure));
        } finally {
            setSaving(false);
        }
    }

    function errorText(field) {
        return <Form.Control.Feedback type="invalid">{fieldErrors[field]}</Form.Control.Feedback>;
    }

    if (loadError) return <Alert variant="danger">{loadError}</Alert>;
    if (!product) return <p>Đang tải form sản phẩm…</p>;

    const activeCount = product.variants.filter((variant) => variant.active).length;

    return (
        <>
            <Form noValidate onSubmit={submit} className="bg-white rounded-4 shadow-sm p-4">
                {submitError && <Alert variant="danger">{submitError}</Alert>}
                <fieldset disabled={saving}>
                    <Row className="g-3 mb-3">
                        <Col md={6}>
                            <Form.Group controlId="productName">
                                <Form.Label>Tên sản phẩm</Form.Label>
                                <Form.Control value={product.name} required maxLength={255}
                                              isInvalid={Boolean(fieldErrors.name)}
                                              onChange={(event) => setField("name", event.target.value)} />
                                {errorText("name")}
                            </Form.Group>
                        </Col>
                        <Col md={productId ? 3 : 6}>
                            <Form.Group controlId="productCategory">
                                <Form.Label>Danh mục</Form.Label>
                                <Form.Select required value={product.categoryId}
                                             isInvalid={Boolean(fieldErrors.categoryId)}
                                             onChange={(event) => setField("categoryId", event.target.value)}>
                                    <option value="">Chọn danh mục</option>
                                    {product.categoryId && !categories.some((category) => category.id === product.categoryId) && (
                                        <option value={product.categoryId} disabled>{product.categoryName} (ngừng hoạt động)</option>
                                    )}
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </Form.Select>
                                {errorText("categoryId")}
                            </Form.Group>
                        </Col>
                        {productId && (
                            <Col md={3}>
                                <Form.Group controlId="productStatus">
                                    <Form.Label>Trạng thái kinh doanh</Form.Label>
                                    <Form.Select value={product.status}
                                                 onChange={(event) => setField("status", event.target.value)}>
                                        <option value="ACTIVE">Đang kinh doanh</option>
                                        <option value="INACTIVE">Ngừng kinh doanh</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        )}
                    </Row>
                    <Form.Group controlId="productDescription" className="mb-4">
                        <Form.Label>Mô tả sản phẩm</Form.Label>
                        <Form.Control as="textarea" rows={2} value={product.description} required maxLength={1000}
                                      isInvalid={Boolean(fieldErrors.description)}
                                      onChange={(event) => setField("description", event.target.value)} />
                        {errorText("description")}
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h2 className="h5 mb-0">
                            Biến thể sản phẩm
                            {productId && <span className="text-muted fs-6 fw-normal"> ({activeCount} đang bán)</span>}
                        </h2>
                        {hiddenIds.size > 0 && (
                            <Form.Check id="showInactive" label={`Hiện ${hiddenIds.size} biến thể đã ngừng bán`}
                                        checked={showInactive}
                                        onChange={(event) => setShowInactive(event.target.checked)} />
                        )}
                    </div>
                    <Table responsive size="sm" className="align-middle mb-3">
                        <thead className="table-light">
                        <tr>
                            <th style={{ width: "22%" }}>Mã SKU</th>
                            <th>Màu sắc</th>
                            <th>Kích cỡ</th>
                            <th>Giá bán (VND)</th>
                            <th>Giá trước giảm (VND)</th>
                            {productId && <th className="text-center">Đang bán</th>}
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {product.variants.map((variant, index) => {
                            if (!showInactive && hiddenIds.has(variant.id)) return null;
                            const rowClass = variant.id && !variant.active ? "table-secondary" : "";
                            return (
                                <tr key={variant.key} className={rowClass}>
                                    <td>
                                        {variant.id ? (
                                            <span className="font-monospace d-inline-block">{variant.sku}</span>
                                        ) : (
                                            <>
                                                <Form.Control size="sm" aria-label="Mã SKU" value={variant.sku} maxLength={64}
                                                              isInvalid={Boolean(fieldErrors[`variants[${index}].sku`])}
                                                              onChange={(event) => setVariantField(variant.key, "sku", event.target.value)} />
                                                {errorText(`variants[${index}].sku`)}
                                            </>
                                        )}
                                    </td>
                                    {[
                                        ["color", "Màu sắc", 100],
                                        ["size", "Kích cỡ", 40],
                                    ].map(([field, label, maxLength]) => (
                                        <td key={field}>
                                            <Form.Control size="sm" aria-label={label} value={variant[field]} maxLength={maxLength}
                                                          isInvalid={Boolean(fieldErrors[`variants[${index}].${field}`])}
                                                          onChange={(event) => setVariantField(variant.key, field, event.target.value)} />
                                            {errorText(`variants[${index}].${field}`)}
                                        </td>
                                    ))}
                                    {[
                                        ["price", "Giá bán"],
                                        ["originalPrice", "Giá trước giảm"],
                                    ].map(([field, label]) => (
                                        <td key={field}>
                                            <Form.Control size="sm" type="number" min="0" step="1" aria-label={label}
                                                          value={variant[field]}
                                                          isInvalid={Boolean(fieldErrors[`variants[${index}].${field}`])}
                                                          onChange={(event) => setVariantField(variant.key, field, event.target.value)} />
                                            {errorText(`variants[${index}].${field}`)}
                                        </td>
                                    ))}
                                    {productId && (
                                        <td className="text-center">
                                            <Form.Check aria-label="Đang bán" checked={variant.active}
                                                        onChange={(event) => setVariantField(variant.key, "active", event.target.checked)} />
                                        </td>
                                    )}
                                    <td className="text-end">
                                        {!variant.id && product.variants.length > 1 && (
                                            <Button type="button" size="sm" variant="danger" title="Bỏ dòng" className="text-nowrap"
                                                    onClick={() => setField("variants", product.variants.filter(({ key }) => key !== variant.key))}>
                                                Bỏ
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </Table>
                    <Button type="button" variant="primary" className="mb-4"
                            onClick={() => setField("variants", [...product.variants, newVariant()])}>
                        Thêm biến thể
                    </Button>
                    {!productId && (
                        <section className="border-top pt-3 mb-3">
                            <h2 className="h5">Ảnh sản phẩm</h2>
                            <p className="text-muted">Tạo sản phẩm trước để tải ảnh theo màu của các biến thể.</p>
                        </section>
                    )}
                    <div className="d-flex justify-content-between gap-2">
                        <Button as={Link} to={listPath} variant="primary">Quay lại danh sách</Button>
                        <Button type="submit" variant="primary">
                            {saving ? "Đang lưu…" : productId ? "Lưu thay đổi" : "Tạo sản phẩm"}
                        </Button>
                    </div>
                </fieldset>
            </Form>
            {productId && <ProductImages productId={productId} variants={savedVariants} />}
        </>
    );
}

export default function ProductForm() {
    const { productId } = useParams();
    const location = useLocation();
    const [revision, setRevision] = useState(0);
    const notice = revision > 0 ? "Đã lưu thay đổi sản phẩm." : location.state?.notice;

    return (
        <Container fluid className="py-2 px-0">
            <p className="text-muted small mb-2">Quản trị / Quản lý sản phẩm</p>
            <h1 className="h3 fw-bold mb-4">{productId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</h1>
            {notice && <Alert variant="success">{notice}</Alert>}
            <ProductEditor key={`${productId ?? "new"}-${revision}`} productId={productId}
                           onSaved={() => setRevision((previous) => previous + 1)} />
        </Container>
    );
}
