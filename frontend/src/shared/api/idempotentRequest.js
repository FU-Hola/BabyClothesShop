// Keep an unanswered request key across reloads. Domain constraints protect new-key retries too.
const memory = new Map();
export async function idempotentRequest(scope, body, send) {
    const storageKey = `request-attempt:${scope}:${JSON.stringify(body ?? null)}`;
    let key = memory.get(storageKey);
    try { key ??= sessionStorage.getItem(storageKey); } catch { /* Storage can be unavailable. */ }
    key ??= globalThis.crypto.randomUUID?.()
        ?? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
    memory.set(storageKey, key);
    try { sessionStorage.setItem(storageKey, key); } catch { /* In-memory retry remains available. */ }
    const response = await send({ "Idempotency-Key": key });
    memory.delete(storageKey);
    try { sessionStorage.removeItem(storageKey); } catch { /* No further action needed. */ }
    return response;
}
