import { warehouseTransport } from "../../../../../shared/api/warehouse.transport.js";
import { uuidSchema } from "../../../../../shared/schemas/warehouse.schemas.js";
import { issueSummarySchema, issueDetailSchema } from "./issue.contracts.js";

export function createIssueApi({ request, getPage } = warehouseTransport) {
    function issuePath(id, suffix = "") {
        return `/issues/${uuidSchema.parse(id)}${suffix}`;
    }

    return {
        issues: (params, signal) => getPage("/issues", params, signal, issueSummarySchema),

        issue: (id, signal) =>
            request(
                {
                    method: "GET",
                    url: issuePath(id),
                    signal,
                },
                issueDetailSchema,
            ),

        createIssue: (body) =>
            request(
                {
                    method: "POST",
                    url: "/issues",
                    data: body,
                },
                issueDetailSchema,
            ),

        startPicking: (id, body) =>
            request(
                {
                    method: "POST",
                    url: issuePath(id, "/start-picking"),
                    data: body,
                },
                issueDetailSchema,
            ),

        updatePicking: (id, body) =>
            request(
                {
                    method: "PUT",
                    url: issuePath(id, "/picking"),
                    data: body,
                },
                issueDetailSchema,
            ),

        packIssue: (id, body) =>
            request(
                {
                    method: "POST",
                    url: issuePath(id, "/pack"),
                    data: body,
                },
                issueDetailSchema,
            ),

        exportIssue: (id, body) =>
            request(
                {
                    method: "POST",
                    url: issuePath(id, "/export"),
                    data: body,
                },
                issueDetailSchema,
            ),

        cancelIssue: (id, body) =>
            request(
                {
                    method: "POST",
                    url: issuePath(id, "/cancel"),
                    data: body,
                },
                issueDetailSchema,
            ),

    };
}

export const issueApi = createIssueApi();
