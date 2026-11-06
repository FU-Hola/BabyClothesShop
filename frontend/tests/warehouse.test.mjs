import { WarehouseApiError } from "../src/shared/api/WarehouseApiError.js";
import test from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
    createWarehouseApi,
} from "../src/modules/goods-receipt-packing/application/api/warehouse.api.js";
import { cancelIssueSchema, exportIssueSchema, packIssueSchema, pickingSchema } from "../src/modules/goods-receipt-packing/features/issues/schemas/issue.schemas.js";
import { cancelReceiptSchema, confirmReceiptSchema, createReceiptSchema } from "../src/modules/goods-receipt-packing/features/receipts/schemas/receipt.schemas.js";
import { inventoryFilterSchema } from "../src/modules/goods-receipt-packing/features/inventory/schemas/inventory.schemas.js";
import { quantitySchema } from "../src/shared/schemas/warehouse.schemas.js";
import {
    needsReconciliation,
    performWarehouseWrite,
} from "../src/modules/goods-receipt-packing/application/query/warehouse.mutations.js";
import { warehouseKeys } from "../src/shared/query/warehouse.keys.js";

const id = "10000000-0000-4000-8000-000000000001";
const otherId = "10000000-0000-4000-8000-000000000002";
const receipt = { items: [{ goodsReceiptItemId: id, expectedQuantity: 10 }] };
const issue = { items: [{ issueItemId: id, orderedQuantity: 10 }] };
const page = {
    items: [],
    page: 1,
    size: 10,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
};
const envelope = (data) => ({ status: 200, data: { success: true, status: 200, data } });

// Các kiểm tra tập trung vào ranh giới nghiệp vụ, không chỉ lặp lại cách render JSX.
test("Số lượng: bỏ trống không bị ép thành 0; chỉ nhận số nguyên trong giới hạn Java", () => {
    for (const invalid of ["", " ", null, undefined, -1, 1.5, "abc", 2147483648])
        assert.equal(quantitySchema().safeParse(invalid).success, false);
    assert.equal(quantitySchema().parse("0"), 0);
    assert.equal(quantitySchema(1).safeParse(0).success, false);
});

test("Tạo nhập kho: loại metadata UI khỏi body; không chấp nhận SKU trùng hoặc ngày không hợp lệ", () => {
    const body = {
        supplierName: " NCC ",
        expectedDate: "2099-01-01",
        note: "",
        items: [{ variantId: id, sku: "SKU-UI", expectedQuantity: "3" }],
    };
    assert.deepEqual(createReceiptSchema.parse(body).items, [
        { variantId: id, expectedQuantity: 3 },
    ]);
    assert.equal(createReceiptSchema.parse(body).supplierName, "NCC");
    assert.equal(
        createReceiptSchema.safeParse({ ...body, items: [...body.items, ...body.items] }).success,
        false,
    );
    assert.equal(
        createReceiptSchema.safeParse({ ...body, expectedDate: "2099-02-30" }).success,
        false,
    );
    assert.equal(createReceiptSchema.safeParse({ ...body, items: [] }).success, false);
});

test("Xác nhận nhập: đủ dòng, đúng ID; chênh lệch cần ghi chú, cho phép nhận 0 hoặc lớn hơn dự kiến", () => {
    const body = {
        version: 0,
        goodsReceiptStatus: "COMPLETED",
        discrepancyNote: "",
        items: [{ receiptItemId: id, receivedQuantity: "10" }],
    };
    const schema = confirmReceiptSchema(receipt);
    assert.equal(schema.safeParse(body).success, true);
    assert.equal(schema.safeParse({ ...body, goodsReceiptStatus: "CANCELLED" }).success, false);
    assert.equal(
        schema.safeParse({ ...body, items: [{ receiptItemId: otherId, receivedQuantity: 10 }] })
            .success,
        false,
    );
    assert.equal(
        schema.safeParse({ ...body, items: [...body.items, ...body.items] }).success,
        false,
    );
    for (const receivedQuantity of [0, 15]) {
        const changed = { ...body, items: [{ receiptItemId: id, receivedQuantity }] };
        assert.equal(schema.safeParse(changed).success, false);
        assert.equal(
            schema.safeParse({ ...changed, discrepancyNote: "Chênh lệch thực nhận" }).success,
            true,
        );
    }
});

test("Soạn hàng: lưu tiến độ được nhưng không vượt đặt; không gửi thiếu hoặc thay dòng", () => {
    const schema = pickingSchema(issue);
    const body = { version: 1, items: [{ issueItemId: id, pickedQuantity: "5" }] };
    assert.equal(schema.parse(body).items[0].pickedQuantity, 5);
    assert.equal(schema.safeParse({ ...body, items: [] }).success, false);
    assert.equal(
        schema.safeParse({ ...body, items: [{ issueItemId: id, pickedQuantity: 11 }] }).success,
        false,
    );
    assert.equal(
        schema.safeParse({ ...body, items: [{ issueItemId: otherId, pickedQuantity: 5 }] }).success,
        false,
    );
});

test("Hủy nhập optional note; hủy xuất bắt buộc reason; bao bì và vận chuyển khớp BE", () => {
    assert.equal(cancelReceiptSchema.safeParse({ version: 0, note: "" }).success, true);
    assert.equal(cancelIssueSchema.safeParse({ version: 0, reason: " " }).success, false);
    assert.equal(packIssueSchema.safeParse({ version: 0, packagingType: "BOX" }).success, false);
    assert.equal(packIssueSchema.safeParse({ version: 0, packagingType: "CARTON" }).success, true);
    assert.equal(
        exportIssueSchema.safeParse({ version: 0, carrierName: "", trackingNumber: "", note: "" })
            .success,
        false,
    );
});

test("Bộ lọc tồn kho tách variantSize khỏi size phân trang", () => {
    assert.deepEqual(
        inventoryFilterSchema.parse({ keyword: "", variantSize: "M", productStatus: "", size: 20 }),
        { keyword: "", variantSize: "M", productStatus: "" },
    );
});

test("Adapter giữ page từ 1 và truyền đúng tham số lọc", async () => {
    let config;
    const api = createWarehouseApi({
        request: async (value) => {
            config = value;
            return envelope(page);
        },
    });
    assert.equal(
        (await api.inventory({ page: 1, size: 10, variantSize: "M", keyword: "" })).page,
        1,
    );
    assert.deepEqual(config.params, { page: 1, size: 10, variantSize: "M" });
    assert.equal(config.url, "");
});

test("API chọn SKU giữ null, tồn 0; endpoint không phụ thuộc bảng tồn kho đang phân trang", async () => {
    let config;
    const api = createWarehouseApi({
        request: async (value) => {
            config = value;
            return envelope([{ variantId: id, sku: "SKU", color: null, size: null, quantity: 0 }]);
        },
    });
    assert.equal((await api.variants(otherId))[0].quantity, 0);
    assert.equal(config.url, `/receipt-options/products/${otherId}/variants`);
});

test("Adapter ghi nhập: đúng method/path, null response không thành lỗi", async () => {
    const requests = [];
    const api = createWarehouseApi({
        request: async (value) => {
            requests.push(value);
            return envelope(null);
        },
    });
    const body = { version: 2, note: "Hủy" };
    await api.createReceipt({ items: [] });
    await api.confirmReceipt(id, { version: 1 });
    await api.cancelReceipt(id, body);
    assert.deepEqual(
        requests.map(({ method, url }) => [method, url]),
        [
            ["POST", "/create"],
            ["PATCH", `/confirm/${id}`],
            ["PATCH", `/cancel/${id}`],
        ],
    );
    assert.equal(requests[2].data, body);
});

test("Envelope/response sai bị báo contract error; lỗi BE giữ field và requestId", async () => {
    for (const response of [{ status: 200, data: {} }, envelope({ ...page, page: 0 })]) {
        const api = createWarehouseApi({ request: async () => response });
        await assert.rejects(api.receipts({ page: 1 }), (error) => error.kind === "contract");
    }
    const api = createWarehouseApi({
        request: async () => {
            throw {
                response: {
                    status: 409,
                    data: {
                        message: "Version cũ",
                        requestId: "request-1",
                        errors: { "items[0].receivedQuantity": "Sai" },
                    },
                },
            };
        },
    });
    await assert.rejects(
        api.cancelReceipt(id, {}),
        (error) =>
            error instanceof WarehouseApiError &&
            error.status === 409 &&
            error.requestId === "request-1" &&
            error.fields["items[0].receivedQuantity"] === "Sai",
    );
});

test("Ghi thành công nhưng GET refetch lỗi: vẫn thành công, không gọi POST lần hai", async () => {
    let writes = 0;
    const client = {
        cancelQueries: async () => {},
        invalidateQueries: async () => {
            throw new Error("GET offline");
        },
    };
    const api = {
        confirmReceipt: async () => {
            writes++;
            return null;
        },
    };
    const result = await performWarehouseWrite(client, api, "receipt", id, {
        action: "confirm",
        body: {},
    });
    assert.deepEqual(result, { data: null, refreshFailed: true });
    assert.equal(writes, 1);
});

test("Mutation thất bại: giữ cache, không invalidation hoặc retry tự động", async () => {
    let writes = 0;
    let invalidations = 0;
    const client = {
        cancelQueries: async () => {},
        invalidateQueries: async () => {
            invalidations++;
        },
    };
    await assert.rejects(
        performWarehouseWrite(
            client,
            {
                cancelReceipt: async () => {
                    writes++;
                    throw new WarehouseApiError("Conflict", { status: 409 });
                },
            },
            "receipt",
            id,
            { action: "cancel", body: {} },
        ),
    );
    assert.equal(writes, 1);
    assert.equal(invalidations, 0);
});

test("Recreate cập nhật đúng ID mới, không ghi đè lịch sử phiếu hủy", async () => {
    const client = new QueryClient();
    const previous = { id, status: "CANCELLED" };
    const current = { id: otherId, status: "PENDING" };
    client.setQueryData(warehouseKeys.detail("issue", id), previous);
    await performWarehouseWrite(client, { recreateIssue: async () => current }, "issue", id, {
        action: "recreate",
        body: {},
    });
    assert.deepEqual(client.getQueryData(warehouseKeys.detail("issue", id)), previous);
    assert.deepEqual(client.getQueryData(warehouseKeys.detail("issue", otherId)), current);
    client.clear();
});

test("Chỉ nhập thành công/xuất thành công làm mới tồn và thống kê; hủy xuất không sửa order/stock", async () => {
    for (const action of ["confirm", "cancel", "export"]) {
        const keys = [];
        const resource = action === "confirm" ? "receipt" : "issue";
        const client = {
            cancelQueries: async () => {},
            setQueryData: () => {},
            invalidateQueries: async ({ queryKey }) => keys.push(queryKey),
        };
        const api = {
            confirmReceipt: async () => null,
            cancelIssue: async () => ({ id }),
            exportIssue: async () => ({ id }),
        };
        await performWarehouseWrite(client, api, resource, id, { action, body: {} });
        assert.equal(
            keys.some((key) => key === warehouseKeys.inventory),
            action !== "cancel",
        );
        assert.equal(
            keys.some((key) => key === warehouseKeys.statistics),
            action !== "cancel",
        );
    }
});

test("409, mất mạng, 5xx, response sai cần đối chiếu lại; validation không khóa vĩnh viễn form", () => {
    for (const error of [
        { status: 409 },
        { status: 0 },
        { status: 500 },
        { status: 200, kind: "contract" },
    ])
        assert.equal(needsReconciliation(error), true);
    assert.equal(needsReconciliation({ status: 400 }), false);
    assert.equal(needsReconciliation({ status: 422 }), false);
});
