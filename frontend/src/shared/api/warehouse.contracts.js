import { z } from "zod";
import { uuidSchema } from "../schemas/warehouse.schemas.js";

export const integer = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const nullableText = z.string().nullable();
export const nullableId = uuidSchema.nullable();

export function pageSchema(itemSchema) {
    return z.object({
        items: z.array(itemSchema),
        page: integer.min(1),
        size: integer.min(1).max(100),
        totalItems: integer,
        totalPages: integer,
        hasNext: z.boolean(),
        hasPrevious: z.boolean(),
    });
}
