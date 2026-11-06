import { useEffect, useState } from "react";
import { Alert, Button, Col, Form, Image, Row } from "react-bootstrap";
import {
    catalogError, deleteProductImage, getProductImages,
    updateProductImageOrder, uploadProductImage,
} from "../api/catalog-stock.api.js";

const colorKey = (color) => color?.trim().toLowerCase() ?? "";

export default function ProductImages({ productId, variants }) {
    const [images, setImages] = useState(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [busy, setBusy] = useState(false);
    const [filter, setFilter] = useState("");

    const colors = new Map(variants.map(({ color }) => [colorKey(color), color.trim()]));
    const groups = new Map(colors);
    for (const image of images ?? []) {
        const key = colorKey(image.color);
        if (!groups.has(key)) {
            groups.set(key, image.color ? `${image.color} (màu cũ)` : "Ảnh chưa gắn màu");
        }
    }
    const visibleImages = (images ?? []).filter((image) =>
        !filter || colorKey(image.color) === filter
    );

    useEffect(() => {
        let cancelled = false;
        getProductImages(productId)
            .then((data) => { if (!cancelled) setImages(data); })
            .catch((failure) => { if (!cancelled) setError(catalogError(failure)); });
        return () => { cancelled = true; };
    }, [productId]);

    async function reloadImages() {
        try {
            setImages(await getProductImages(productId));
        } catch (failure) {
            setImages(null);
            throw failure;
        }
    }

    async function runAction(action, successMessage) {
        setBusy(true);
        setError("");
        setNotice("");
        try {
            await action();
            setNotice(successMessage);
            await reloadImages();
        } catch (failure) {
            setError(catalogError(failure));
        } finally {
            setBusy(false);
        }
    }

    function upload(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        void runAction(async () => {
            await uploadProductImage(productId, data);
            form.reset();
        }, "Đã tải ảnh lên.");
    }

    return (
        <section className="bg-white rounded-4 shadow-sm p-4 mt-4">
            <h2 className="h5 mb-3">Ảnh sản phẩm</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {notice && <Alert variant="success">{notice}</Alert>}
            {images === null && !error && <p>Đang tải ảnh…</p>}
            {images === null && error && (
                <Button type="button" variant="outline-secondary" disabled={busy}
                        onClick={() => runAction(reloadImages, "")}>Tải lại danh sách ảnh</Button>
            )}
            <Form onSubmit={upload} className="mb-4">
                <fieldset disabled={busy || images === null || colors.size === 0}>
                    <Row className="g-3 align-items-end">
                        <Col md={3}>
                            <Form.Group controlId="uploadColor">
                                <Form.Label>Màu ảnh</Form.Label>
                                <Form.Select name="color" required defaultValue="">
                                    <option value="">Chọn màu</option>
                                    {[...colors].map(([key, color]) => (
                                        <option key={key} value={color}>{color}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group controlId="uploadFile">
                                <Form.Label>File ảnh</Form.Label>
                                <Form.Control name="file" type="file" accept="image/jpeg,image/png,image/webp" required />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Form.Group controlId="uploadOrder">
                                <Form.Label>Thứ tự</Form.Label>
                                <Form.Control name="sortOrder" type="number" min="0" step="1" defaultValue="0" required />
                            </Form.Group>
                        </Col>
                        <Col md={2}><Button type="submit">Tải ảnh lên</Button></Col>
                    </Row>
                </fieldset>
            </Form>
            {images !== null && (
                <>
                    <Form.Group controlId="imageColorFilter" className="mb-3">
                        <Form.Label>Lọc ảnh theo màu</Form.Label>
                        <Form.Select value={filter} onChange={(event) => setFilter(event.target.value)}>
                            <option value="">Tất cả ảnh</option>
                            {[...groups].filter(([key]) => key).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    {visibleImages.length === 0 && <p className="text-muted mb-0">Chưa có ảnh phù hợp.</p>}
                    <Row xs={1} sm={2} lg={3} className="g-3">
                        {visibleImages.map((image) => (
                            <Col key={image.id}>
                                <div className="border rounded p-3">
                                    <Image src={image.imageUrl} alt={image.color || "Ảnh sản phẩm"}
                                           width={120} height={120} rounded className="object-fit-contain" />
                                    <p className="mt-2 mb-2">{groups.get(colorKey(image.color))}</p>
                                    <Form className="d-flex gap-2 mb-2" onSubmit={(event) => {
                                        event.preventDefault();
                                        const order = Number(new FormData(event.currentTarget).get("sortOrder"));
                                        void runAction(
                                            () => updateProductImageOrder(productId, image.id, order),
                                            "Đã lưu thứ tự ảnh."
                                        );
                                    }}>
                                        <Form.Control key={image.sortOrder} aria-label="Thứ tự ảnh" name="sortOrder"
                                                      type="number" min="0" step="1" required
                                                      defaultValue={image.sortOrder} disabled={busy} />
                                        <Button type="submit" size="sm" variant="outline-primary" disabled={busy}>Lưu</Button>
                                    </Form>
                                    <Button type="button" size="sm" variant="outline-danger" disabled={busy}
                                            onClick={() => {
                                                if (window.confirm("Xóa ảnh này khỏi sản phẩm?")) {
                                                    void runAction(() => deleteProductImage(productId, image.id), "Đã xóa ảnh.");
                                                }
                                            }}>Xóa ảnh</Button>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </section>
    );
}
