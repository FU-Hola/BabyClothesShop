import { Alert, Button, Form, Spinner } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useWarehouseMutation } from "../query/warehouse.queries.js";

export function ActionForm({
    resource, id, action, schema, defaultValues, title, description,
    confirmText, disabled, onCompleted, children, danger = false,
}) {
    const form = useForm({ resolver: zodResolver(schema), defaultValues });
    const mutation = useWarehouseMutation(resource, id);
    const blocked = disabled || form.formState.isSubmitting || mutation.isSuccess;

    async function submit(body) {
        if (blocked || (confirmText && !window.confirm(confirmText))) return;
        try {
            await mutation.mutateAsync({ action, body });
            onCompleted?.();
        } catch (error) {
            Object.entries(error.fields || {}).forEach(([name, message]) => {
                form.setError(name.replace(/\[(\d+)\]/g, ".$1"), { message: String(message) });
            });
        }
    }

    return (
        <section className="admin-card p-4 mb-4">
            <h2 className="h5">{title}</h2>
            {description && <p className="text-muted">{description}</p>}
            <FormProvider {...form}>
                <Form noValidate onSubmit={form.handleSubmit(submit)}>
                    {mutation.isError && <Alert variant="danger">{mutation.error.message}</Alert>}
                    {Object.keys(form.formState.errors).length > 0 && (
                        <Alert variant="danger">
                            Vui lòng kiểm tra các trường được đánh dấu.{" "}
                            {form.formState.errors.items?.message || form.formState.errors.items?.root?.message}
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
