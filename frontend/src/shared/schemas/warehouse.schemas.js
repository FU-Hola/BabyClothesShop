import { z } from "zod";

const JAVA_INTEGER_MAX = 2_147_483_647;

export const uuidSchema = z.string().trim().uuid("ID không đúng định dạng UUID");

export const versionSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

// Java @Size đo độ dài String theo UTF-16, tương ứng value.length.
export function textSchema(maxLength, required = false) {
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

export function validateExactLines(submittedItems, sourceItems, submittedIdField, sourceIdField, context) {
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
