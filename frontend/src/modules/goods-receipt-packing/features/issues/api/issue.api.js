import { warehouseRequest as request, warehousePage } from "../../../../../shared/api/warehouse.transport.js";

export const issueApi = {
    issues: (params, signal) => warehousePage("/issues", params, signal),
    issue: (id, signal) => request({ method: "GET", url: `/issues/${id}`, signal }),
    startPicking: (id, body, key) => request({ method: "POST", url: `/issues/${id}/start-picking`, data: body, headers: { "Idempotency-Key": key } }),
    updatePicking: (id, body, key) => request({ method: "PUT", url: `/issues/${id}/picking`, data: body, headers: { "Idempotency-Key": key } }),
    packIssue: (id, body, key) => request({ method: "POST", url: `/issues/${id}/pack`, data: body, headers: { "Idempotency-Key": key } }),
    exportIssue: (id, body, key) => request({ method: "POST", url: `/issues/${id}/export`, data: body, headers: { "Idempotency-Key": key } }),
    cancelIssue: (id, body, key) => request({ method: "POST", url: `/issues/${id}/cancel`, data: body, headers: { "Idempotency-Key": key } }),
};
