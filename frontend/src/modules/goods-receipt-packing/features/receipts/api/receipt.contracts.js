import { z } from "zod";
import { integer, nullableText, nullableId } from "../../../../../shared/api/warehouse.contracts.js";
import { uuidSchema, versionSchema } from "../../../../../shared/schemas/warehouse.schemas.js";
import { receiptStatusSchema } from "../schemas/receipt.schemas.js";

export const receiptSummarySchema = z.looseObject({
    goodsReceiptId: uuidSchema,
    code: z.string(),
    supplierName: z.string(),
    createdAt: z.string(),
    expectedQuantity: integer,
    goodsReceiptStatus: receiptStatusSchema,
    version: versionSchema,
});

// Kiểm tra các field trong contract
export const receiptDetailSchema = z.looseObject({
    goodsReceiptId: uuidSchema,
    code: z.string(),
    supplierName: z.string(),
    expectedDate: z.string(),
    note: nullableText,
    goodsReceiptStatus: receiptStatusSchema,
    createdBy: nullableId,
    createdAt: z.string(),
    confirmAt: nullableText,
    confirmedAt: nullableText,
    cancelledAt: nullableText,
    cancellationReason: nullableText,
    discrepancyNote: nullableText,
    version: versionSchema,

    items: z.array(
        z.looseObject({
            goodsReceiptItemId: uuidSchema,
            variantId: uuidSchema,
            sku: nullableText,
            productName: nullableText,
            categoryName: nullableText,
            color: nullableText,
            size: nullableText,
            expectedQuantity: integer,
            receivedQuantity: integer.nullable(),
        }),
    ),
});

export const statusOptionsSchema = z.array(
    z.object({
        code: z.string(),
        label: z.string(),
    }),
);
