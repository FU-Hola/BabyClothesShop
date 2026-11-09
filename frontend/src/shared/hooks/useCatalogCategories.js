import { useQuery } from "@tanstack/react-query";
import { getCatalogCategories } from "../api/catalogApi.js";

export function useCatalogCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getCatalogCategories,
    });
}
