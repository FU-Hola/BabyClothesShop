export function validationMessages(errors) {
    const messages = new Set();

    function visit(error, path = []) {
        if (!error || typeof error !== "object") return;

        if (typeof error.message === "string" && error.message) {
            const row = path[0] === "items" && /^\d+$/.test(path[1] ?? "")
                ? `Dòng ${Number(path[1]) + 1}: `
                : "";
            messages.add(`${row}${error.message}`);
        }

        for (const [key, value] of Object.entries(error)) {
            if (!["message", "type", "types", "ref"].includes(key)) {
                visit(value, [...path, key]);
            }
        }
    }

    visit(errors);
    return [...messages];
}
