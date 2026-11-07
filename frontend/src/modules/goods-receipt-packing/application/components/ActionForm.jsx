import { useRef, useState } from "react";
import { Alert, Button, Form, Modal, Spinner } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIsMutating } from "@tanstack/react-query";
import { useWarehouseMutation } from "../query/warehouse.queries.js";
import { needsReconciliation } from "../query/warehouse.mutations.js";
import { warehouseKeys } from "../../../../shared/query/warehouse.keys.js";
import { useWarehouseDraft } from "../../../../shared/hooks/useWarehouseDraft.js";

export function ActionForm({
    resource,
    id,
    action,
    schema,
    defaultValues,
    title,
    description,
    confirmText,
    disabled,
    onCompleted,
    onUncertain,
    children,
    danger = false,
}) {
    const form = useForm({ resolver: zodResolver(schema), defaultValues });
    const mutation = useWarehouseMutation(resource, id);
    const writing = useIsMutating({ mutationKey: warehouseKeys.write(resource, id) }) > 0;
    const [pendingBody, setPendingBody] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [uncertain, setUncertain] = useState(false);
    const latch = useRef(false);
    const blocked = disabled || writing || completed || uncertain;
    useWarehouseDraft(form.formState.isDirty && !completed);

    async function execute() {
        if (latch.current || blocked || !pendingBody) return;
        latch.current = true;
        form.clearErrors();
        try {
            const result = await mutation.mutateAsync({ action, body: pendingBody });
            setCompleted(true);
            setPendingBody(null);
            onCompleted?.(result);
        } catch (error) {
            setPendingBody(null);
            form.setError("root.server", { message: error.message });
            // Giữ nguyên bản nhập. Không tự thay version rồi gửi lại một thao tác chưa rõ kết quả.
            if (needsReconciliation(error)) {
                setUncertain(true);
                onUncertain?.();
            }
            if (error.fields && typeof error.fields === "object") {
                Object.entries(error.fields).forEach(([name, message]) => {
                    form.setError(name.replace(/\[(\d+)\]/g, ".$1"), { message: String(message) });
                });
            }
        } finally {
            latch.current = false;
        }
    }

    return (
        <section className="admin-card p-4 mb-4">
            <h2 className="h5">{title}</h2>
            {description && <p className="text-muted">{description}</p>}
            <FormProvider {...form}>
                <Form
                    noValidate
                    onSubmit={form.handleSubmit((body) => {
                        if (!blocked) setPendingBody(body);
                    })}
                >
                    {form.formState.errors.root?.server && (
                        <Alert variant="danger" role="alert">
                            {form.formState.errors.root.server.message}
                            {mutation.error?.requestId && (
                                <small className="d-block">
                                    Mã yêu cầu: {mutation.error.requestId}
                                </small>
                            )}
                        </Alert>
                    )}
                    {Object.keys(form.formState.errors).some((key) => key !== "root") && (
                        <Alert variant="danger" role="alert">
                            Vui lòng kiểm tra các trường được đánh dấu.{" "}
                            {form.formState.errors.items?.message ||
                                form.formState.errors.items?.root?.message}
                        </Alert>
                    )}
                    {uncertain && (
                        <Alert variant="warning">
                            Cần tải lại phiếu để kiểm tra trạng thái mới nhất trước khi tiếp tục. Dữ
                            liệu bạn nhập vẫn được giữ trên màn hình.{" "}
                            {action === "create" &&
                                "Với phiếu mới, mở danh sách để kiểm tra phiếu đã được tạo hay chưa trước khi tạo lại."}
                        </Alert>
                    )}
                    {completed && (
                        <Alert variant="success" role="status">
                            Thao tác đã thành công.
                        </Alert>
                    )}
                    <fieldset disabled={blocked}>
                        {children}
                        <Button
                            type="submit"
                            variant={danger ? "outline-danger" : "primary"}
                            className={danger ? "" : "btn-primary-navy"}
                        >
                            {writing && <Spinner as="span" size="sm" className="me-2" />} {title}
                        </Button>
                    </fieldset>
                </Form>
            </FormProvider>
            <Modal
                show={Boolean(pendingBody)}
                onHide={() => {
                    if (!writing) setPendingBody(null);
                }}
                backdrop="static"
                keyboard={!writing}
                centered
            >
                <Modal.Header closeButton={!writing}>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {confirmText || "Xác nhận lưu thông tin đã nhập?"}
                    <p className="small text-muted mt-3 mb-0">
                        Sau khi thành công, màn hình sẽ cập nhật theo dữ liệu đã lưu. Các thay đổi
                        chưa lưu ở biểu mẫu khác trên phiếu sẽ bị bỏ.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        disabled={writing}
                        onClick={() => setPendingBody(null)}
                    >
                        Quay lại
                    </Button>
                    <Button
                        variant={danger ? "danger" : "primary"}
                        disabled={writing || disabled}
                        onClick={execute}
                    >
                        {writing ? "Đang xử lý…" : "Xác nhận"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    );
}
