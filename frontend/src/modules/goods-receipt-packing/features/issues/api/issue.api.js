import { warehouseRequest as request, warehousePage } from "../../../../../shared/api/warehouse.transport.js";

export const issueApi = {
    issues: (params, signal) => warehousePage("/issues", params, signal),
    issue: (id, signal) => request({ method: "GET", url: `/issues/${id}`, signal }),
    startPicking: (id, body) => request({ method: "POST", url: `/issues/${id}/start-picking`, data: body }),
    updatePicking: (id, body) => request({ method: "PUT", url: `/issues/${id}/picking`, data: body }),
    packIssue: (id, body) => request({ method: "POST", url: `/issues/${id}/pack`, data: body }),
    exportIssue: (id, body) => request({ method: "POST", url: `/issues/${id}/export`, data: body }),
    cancelIssue: (id, body) => request({ method: "POST", url: `/issues/${id}/cancel`, data: body }),
};
