import { z } from "zod";
import {
    idSchema,
    versionSchema,
    textSchema,
    quantitySchema,
} from "../../../../../shared/schemas/warehouse.schemas.js";

function localToday() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const expectedDateSchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Vui lòng chọn ngày dự kiến")
    .refine((value) => {
        const date = new Date(`${value}T00:00:00Z`);

        return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    }, "Ngày không hợp lệ")
    .refine((value) => value >= localToday(), "Ngày dự kiến không được trong quá khứ");

// BE vẫn quyết định ngày hợp lệ theo timezone của server.
export const createReceiptSchema = z
    .object({
        supplierName: textSchema(255, true),
        expectedDate: expectedDateSchema,
        note: textSchema(1000),

        items: z
            .array(
                z.object({
                    variantId: idSchema,
                    expectedQuantity: quantitySchema(1),
                }),
            )
            .min(1, "Cần ít nhất một mặt hàng")
            .max(200, "Tối đa 200 mặt hàng"),
    })
    .superRefine((value, context) => {
        const ids = new Set();

        value.items.forEach((item, index) => {
            if (ids.has(item.variantId)) {
                context.addIssue({
                    code: "custom",
                    path: ["items", index, "variantId"],
                    message: "SKU đã có trong phiếu",
                });
            }

            ids.add(item.variantId);
        });
    });

export function confirmReceiptSchema(receipt) {
    return z
        .object({
            version: versionSchema,
            goodsReceiptStatus: z.literal("COMPLETED"),
            discrepancyNote: textSchema(1000),

            items: z
                .array(
                    z.object({
                        receiptItemId: idSchema,
                        receivedQuantity: quantitySchema(0),
                    }),
                )
                .min(1)
                .max(200),
        })
        .superRefine((value, context) => {
            const expectedById = new Map(
                receipt.items.map((item) => [item.goodsReceiptItemId, item.expectedQuantity]),
            );

            const hasDiscrepancy = value.items.some(
                (item) => item.receivedQuantity !== expectedById.get(item.receiptItemId),
            );

            if (hasDiscrepancy && !value.discrepancyNote) {
                context.addIssue({
                    code: "custom",
                    path: ["discrepancyNote"],
                    message: "Cần ghi chú khi thực nhận khác dự kiến",
                });
            }
        });
}

export const cancelReceiptSchema = z.object({
    version: versionSchema,
    note: textSchema(1000),
});

export const receiptFilterSchema = z.object({
    keyword: textSchema(100),
    status: z.enum(["", "PENDING", "COMPLETED", "CANCELLED"]),
});
