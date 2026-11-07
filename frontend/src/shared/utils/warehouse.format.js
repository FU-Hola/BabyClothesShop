export function display(value) {
    return value == null || value === "" ? "—" : value;
}
export function dateTime(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
}
export function dateOnly(value) {
    if (!value) return "—";
    const parts = value.split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}
