export class WarehouseApiError extends Error {
    constructor(message, { status = 0, fields = null, requestId = null, kind = "api" } = {}) {
        super(message);

        this.name = "WarehouseApiError";
        this.status = status;
        this.fields = fields;
        this.requestId = requestId;
        this.kind = kind;
    }
}
