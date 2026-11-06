import { Button, Form } from "react-bootstrap";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InputField } from "./InputField.jsx";
export default function WarehouseFilters({ schema, values, onApply, fields }) {
    const form = useForm({ resolver: zodResolver(schema), defaultValues: values });
    return (
        <FormProvider {...form}>
            <Form
                noValidate
                className="admin-card p-3 mb-4 warehouse-filter"
                onSubmit={form.handleSubmit((filters) => onApply({ ...filters, page: 1 }))}
            >
                {fields.map((field) => (
                    <InputField key={field.name} {...field} />
                ))}
                <Button type="submit" className="btn-primary-navy">
                    Lọc
                </Button>
                <Button
                    type="button"
                    variant="outline-secondary"
                    onClick={() => {
                        const empty = Object.fromEntries(fields.map(({ name }) => [name, ""]));
                        form.reset({ ...values, ...empty });
                        onApply({ ...empty, page: 1 });
                    }}
                >
                    Xóa lọc
                </Button>
            </Form>
        </FormProvider>
    );
}
