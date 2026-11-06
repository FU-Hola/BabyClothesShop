import { z } from "zod";
import { textSchema } from "../../../../../shared/schemas/warehouse.schemas.js";

export const inventoryFilterSchema = z.object({
    keyword: textSchema(100),
    variantSize: textSchema(40),
    productStatus: z.enum(["", "ACTIVE", "INACTIVE"]),
});
