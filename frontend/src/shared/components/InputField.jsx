import { useId } from "react";
import { Form } from "react-bootstrap";
import { useFormContext } from "react-hook-form";

export function InputField({ name, label, options, help, ...props }) {
    const id = useId();
    const { register, getFieldState, formState } = useFormContext();
    const { error } = getFieldState(name, formState);
    const control = {
        ...register(name),
        ...props,
        isInvalid: Boolean(error),
        "aria-describedby":
            [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(" ") || undefined,
    };
    return (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label>{label}</Form.Label>
            {options ? (
                <Form.Select {...control}>
                    {options.map(([value, text]) => (
                        <option key={value} value={value}>
                            {text}
                        </option>
                    ))}
                </Form.Select>
            ) : (
                <Form.Control {...control} />
            )}
            {help && <Form.Text id={`${id}-help`}>{help}</Form.Text>}
            <Form.Control.Feedback type="invalid" id={`${id}-error`}>
                {error?.message}
            </Form.Control.Feedback>
        </Form.Group>
    );
}

