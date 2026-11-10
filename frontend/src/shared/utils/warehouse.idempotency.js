function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
    }
    return value;
}

function newKey() {
    if (globalThis.crypto.randomUUID) return globalThis.crypto.randomUUID();
    return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),
        (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createWarehouseAttemptKeys(generate = newKey) {
    const attempts = new Map();
    return {
        keyFor(operation, body) {
            const signature = JSON.stringify([operation, canonical(body)]);
            if (!attempts.has(signature)) attempts.set(signature, generate());
            return attempts.get(signature);
        },
    };
}
