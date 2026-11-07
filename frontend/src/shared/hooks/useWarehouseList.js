import { useSearchParams } from "react-router-dom";
export function useWarehouseList(defaults) {
    const [search, setSearch] = useSearchParams();
    const page = Number(search.get("page") || 1);
    const size = Number(search.get("size") || 10);
    const params = Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [key, search.get(key) ?? value]),
    );
    params.page = Number.isSafeInteger(page) && page > 0 ? page : 1;
    params.size = Number.isInteger(size) && size >= 1 && size <= 100 ? size : 10;
    function change(values) {
        const next = new URLSearchParams(search);
        Object.entries(values).forEach(([key, value]) => {
            if (value === "" || value == null) next.delete(key);
            else next.set(key, String(value));
        });
        setSearch(next);
    }
    return { params, change };
}
