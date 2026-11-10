import { useRef } from "react";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWarehouseMutation } from "../query/warehouse.queries.js";
import { validationMessages } from "../../../../shared/utils/warehouse.validation.js";

export function ActionForm({
    resource, id, action, schema, defaultValues, title, description,
    confirmText, disabled, onCompleted, children, danger = false,
}) {
    const form = useForm({ resolver: zodResolver(schema), defaultValues });
    const mutation = useWarehouseMutation(resource, id);
    const submitting = useRef(false);
    const blocked = disabled || form.formState.isSubmitting || mutation.isSuccess;
    const errors = validationMessages(form.formState.errors);

    async function submit(body) {
        if (submitting.current || blocked || (confirmText && !window.confirm(confirmText))) return;
        submitting.current = true;
        try {
            await mutation.mutateAsync({ action, body });
            onCompleted?.();
        } catch (error) {
            Object.entries(error.fields || {}).forEach(([name, message]) => {
                form.setError(name.replace(/\[(\d+)\]/g, ".$1"), { message: String(message) });
            });
        } finally {
            submitting.current = false;
        }
    }

    return (
        <section className="admin-card p-4 mb-4">
            <h2 className="h5">{title}</h2>
            {description && <p className="text-muted">{description}</p>}
            <FormProvider {...form}>
                <Form noValidate onSubmit={(event) => form.handleSubmit(submit)(event)}>
                    {mutation.isError && <Alert variant="danger">{mutation.error.message}</Alert>}
                    {Object.keys(form.formState.errors).length > 0 && (
                        <Alert variant="danger">
                            Vui lòng kiểm tra thông tin sau:
                            <ul className="mb-0 mt-2">
                                {errors.map((message) => <li key={message}>{message}</li>)}
                            </ul>
                        </Alert>
                    )}
                    {mutation.isSuccess && !onCompleted && (
                        <Alert variant="success">Thao tác đã thành công.</Alert>
                    )}
                    <fieldset disabled={blocked}>
                        {children}
                        <Button type="submit" variant={danger ? "outline-danger" : "primary"}
                            className={danger ? "" : "btn-primary-navy"}>
                            {mutation.isPending && <Spinner as="span" size="sm" className="me-2" />}
                            {title}
                        </Button>
                    </fieldset>
                </Form>
            </FormProvider>
        </section>
    );
}
