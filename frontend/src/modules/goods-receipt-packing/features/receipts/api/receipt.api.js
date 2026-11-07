import { warehouseTransport } from "../../../../../shared/api/warehouse.transport.js";
import { z } from "zod";
import { integer, nullableText } from "../../../../../shared/api/warehouse.contracts.js";
import { uuidSchema } from "../../../../../shared/schemas/warehouse.schemas.js";
import { receiptSummarySchema, receiptDetailSchema, statusOptionsSchema } from "./receipt.contracts.js";

export function createReceiptApi({ request, getPage } = warehouseTransport) {
    return {
        products: (params, signal) =>
            getPage(
                "/receipt-options/products",
                params,
                signal,
                z.object({
                    productId: uuidSchema,
                    productName: z.string(),
                    categoryName: nullableText,
                }),
            ),

        variants: (productId, signal) =>
            request(
                {
                    method: "GET",
                    url: `/receipt-options/products/${uuidSchema.parse(productId)}/variants`,
                    signal,
                },
                z.array(
                    z.object({
                        variantId: uuidSchema,
                        sku: z.string(),
                        color: nullableText,
                        size: nullableText,
                        quantity: integer,
                    }),
                ),
            ),

        receipts: (params, signal) => getPage("/receipts", params, signal, receiptSummarySchema),

        receipt: (id, signal) =>
            request(
                {
                    method: "GET",
                    url: `/receipts/${uuidSchema.parse(id)}`,
                    signal,
                },
                receiptDetailSchema,
            ),

        receiptStatuses: (signal) =>
            request(
                {
                    method: "GET",
                    url: "/status",
                    signal,
                },
                statusOptionsSchema,
            ),

        createReceipt: (body) =>
            request(
                {
                    method: "POST",
                    url: "/create",
                    data: body,
                },
                z.null(),
            ),

        confirmReceipt: (id, body) =>
            request(
                {
                    method: "PATCH",
                    url: `/confirm/${uuidSchema.parse(id)}`,
                    data: body,
                },
                z.null(),
            ),

        cancelReceipt: (id, body) =>
            request(
                {
                    method: "PATCH",
                    url: `/cancel/${uuidSchema.parse(id)}`,
                    data: body,
                },
                z.null(),
            ),
    };
}

export const receiptApi = createReceiptApi();
