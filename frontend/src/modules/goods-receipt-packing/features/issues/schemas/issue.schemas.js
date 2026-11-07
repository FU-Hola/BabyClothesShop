import { z } from "zod";
import {
    uuidSchema,
    versionSchema,
    textSchema,
    quantitySchema,
    validateExactLines,
} from "../../../../../shared/schemas/warehouse.schemas.js";

export const issueStatusSchema = z.enum(["PENDING", "PICKING", "PACKED", "EXPORTED", "CANCELLED"]);

export const issueVersionSchema = z.object({
    version: versionSchema,
});

export const createIssueSchema = z.object({
    orderId: uuidSchema,
});

export function pickingSchema(issue) {
    return z
        .object({
            version: versionSchema,

            items: z
                .array(
                    z.object({
                        issueItemId: uuidSchema,
                        pickedQuantity: quantitySchema(0),
                    }),
                )
                .min(1)
                .max(200),
        })
        .superRefine((value, context) => {
            validateExactLines(value.items, issue.items, "issueItemId", "issueItemId", context);

            const orderedById = new Map(
                issue.items.map((item) => [item.issueItemId, item.orderedQuantity]),
            );

            value.items.forEach((item, index) => {
                const orderedQuantity = orderedById.get(item.issueItemId);

                if (orderedQuantity !== undefined && item.pickedQuantity > orderedQuantity) {
                    context.addIssue({
                        code: "custom",
                        path: ["items", index, "pickedQuantity"],
                        message: "Không được vượt số lượng đặt",
                    });
                }
            });
        });
}

export const packIssueSchema = z.object({
    version: versionSchema,
    packagingType: z.enum(["CARTON", "PE_BAG"], {
        error: "Vui lòng chọn loại bao bì",
    }),
});

export const exportIssueSchema = z.object({
    version: versionSchema,
    carrierName: textSchema(255, true),
    trackingNumber: textSchema(100),
    note: textSchema(1000),
});

export const cancelIssueSchema = z.object({
    version: versionSchema,
    reason: textSchema(1000, true),
});

export const issueFilterSchema = z.object({
    keyword: textSchema(100),
    status: z.enum(["", "PENDING", "PICKING", "PACKED", "EXPORTED", "CANCELLED"]),

    orderId: z.union([z.literal(""), uuidSchema]),
});
