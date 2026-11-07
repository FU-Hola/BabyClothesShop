export const warehouseKeys = {
    inventory: ["warehouse", "inventory"],
    statistics: ["warehouse", "statistics"],
    options: ["warehouse", "receipt-options"],
    receiptLists: ["warehouse", "receipts", "list"],
    issueLists: ["warehouse", "issues", "list"],
    detail: (resource, id) => ["warehouse", resource, "detail", id],
    write: (resource, id) => ["warehouse-write", resource, id || "new"],
};
