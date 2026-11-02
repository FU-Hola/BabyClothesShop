import { z } from "zod";

const JAVA_INTEGER_MAX = 2_147_483_647;

export const uuidSchema = z.string().trim().uuid("ID không đúng định dạng UUID");

export const versionSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

export const receiptStatusSchema = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);

export const issueStatusSchema = z.enum(["PENDING", "PICKING", "PACKED", "EXPORTED", "CANCELLED"]);

// Java @Size đo độ dài String theo UTF-16.
// Dùng value.length để khớp giới hạn phía BE.
function textSchema(maxLength, required = false) {
    return z
        .string()
        .trim()
        .refine((value) => !required || value.length > 0, "Vui lòng nhập thông tin")
        .refine((value) => value.length <= maxLength, `Không vượt quá ${maxLength} ký tự`);
}

export function quantitySchema(minimum = 0) {
    return z.preprocess(
        (value) => {
            if (value === "" || value === null || value === undefined) {
                return undefined;
            }

            if (typeof value === "string" && value.trim() === "") {
                return undefined;
            }

            return typeof value === "string" ? Number(value) : value;
        },
        z
            .number({
                error: "Vui lòng nhập số lượng hợp lệ",
            })
            .int("Số lượng phải là số nguyên")
            .min(minimum, `Số lượng phải từ ${minimum} trở lên`)
            .max(JAVA_INTEGER_MAX, "Số lượng vượt giới hạn hệ thống"),
    );
}

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
                    variantId: uuidSchema,
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

function validateExactLines(submittedItems, sourceItems, submittedIdField, sourceIdField, context) {
    const expectedIds = new Set(sourceItems.map((item) => item[sourceIdField]));

    const receivedIds = new Set();

    submittedItems.forEach((item, index) => {
        const id = item[submittedIdField];

        if (!expectedIds.has(id) || receivedIds.has(id)) {
            context.addIssue({
                code: "custom",
                path: ["items", index, submittedIdField],
                message: "Dòng phiếu không hợp lệ hoặc bị trùng",
            });
        }

        receivedIds.add(id);
    });

    const complete =
        submittedItems.length === sourceItems.length &&
        expectedIds.size === receivedIds.size &&
        [...expectedIds].every((id) => receivedIds.has(id));

    if (!complete) {
        context.addIssue({
            code: "custom",
            path: ["items"],
            message: "Phải gửi đầy đủ các dòng của phiếu",
        });
    }
}

export function confirmReceiptSchema(receipt) {
    return z
        .object({
            version: versionSchema,
            goodsReceiptStatus: z.literal("COMPLETED"),
            discrepancyNote: textSchema(1000),

            items: z
                .array(
                    z.object({
                        receiptItemId: uuidSchema,
                        receivedQuantity: quantitySchema(0),
                    }),
                )
                .min(1)
                .max(200),
        })
        .superRefine((value, context) => {
            validateExactLines(
                value.items,
                receipt.items,
                "receiptItemId",
                "goodsReceiptItemId",
                context,
            );

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

export const inventoryFilterSchema = z.object({
    keyword: textSchema(100),
    variantSize: textSchema(40),
    productStatus: z.enum(["", "ACTIVE", "INACTIVE"]),
});

export const issueFilterSchema = z.object({
    keyword: textSchema(100),
    status: z.enum(["", "PENDING", "PICKING", "PACKED", "EXPORTED", "CANCELLED"]),

    orderId: z.union([z.literal(""), uuidSchema]),
});

export const receiptFilterSchema = z.object({
    keyword: textSchema(100),
    status: z.enum(["", "PENDING", "COMPLETED", "CANCELLED"]),
});
