import { z } from "zod";
import { integer, nullableText } from "../../../../../shared/api/warehouse.contracts.js";
import { uuidSchema } from "../../../../../shared/schemas/warehouse.schemas.js";

export const inventorySchema = z.looseObject({
    variantId: uuidSchema,
    productId: uuidSchema,
    sku: z.string(),
    productName: z.string(),
    categoryName: nullableText,
    size: nullableText,
    quantity: integer,
    productStatus: z.enum(["ACTIVE", "INACTIVE"]),
    variantActive: z.boolean(),
});

export const statisticsSchema = z.object({
    totalAvailableQuantity: integer,
    inStockVariantCount: integer,
    outOfStockVariantCount: integer,
});
