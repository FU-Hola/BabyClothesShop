import { z } from "zod";
import { integer, nullableText, nullableId } from "../../../../../shared/api/warehouse.contracts.js";
import { uuidSchema, versionSchema } from "../../../../../shared/schemas/warehouse.schemas.js";
import { issueStatusSchema } from "../schemas/issue.schemas.js";

export const issueSummarySchema = z.looseObject({
    id: uuidSchema,
    code: z.string(),
    orderId: uuidSchema,
    orderCode: z.string(),
    status: issueStatusSchema,
    assignedTo: nullableId,
    createdAt: z.string(),
    version: versionSchema,
});

export const issueDetailSchema = issueSummarySchema.extend({
    orderStatus: z.enum(["PENDING_CONFIRMATION", "CONFIRMED", "PACKED", "SHIPPING", "DELIVERED"]),

    receiverName: nullableText,
    receiverPhone: nullableText,
    receiverAddress: nullableText,
    pickingStartedAt: nullableText,
    packedBy: nullableId,
    packedAt: nullableText,
    packagingType: z.enum(["CARTON", "PE_BAG"]).nullable(),
    exportedBy: nullableId,
    exportedAt: nullableText,
    carrierName: nullableText,
    trackingNumber: nullableText,
    note: nullableText,
    cancelledBy: nullableId,
    cancelledAt: nullableText,
    cancellationReason: nullableText,

    items: z.array(
        z.looseObject({
            issueItemId: uuidSchema,
            orderItemId: uuidSchema,
            variantId: uuidSchema,
            sku: z.string(),
            productName: z.string(),
            color: nullableText,
            size: nullableText,
            orderedQuantity: integer,
            pickedQuantity: integer,
        }),
    ),
});
