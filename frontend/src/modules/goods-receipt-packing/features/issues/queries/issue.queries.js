import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { issueApi } from "../api/issue.api.js";
import { warehouseKeys } from "../../../../../shared/query/warehouse.keys.js";

export function useIssues(params) {
    return useQuery({
        queryKey: [...warehouseKeys.issueLists, params],
        queryFn: ({ signal }) => issueApi.issues(params, signal),
        placeholderData: keepPreviousData,
    });
}
