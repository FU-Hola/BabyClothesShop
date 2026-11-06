import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));
const moduleRoot = join(sourceRoot, "modules/goods-receipt-packing");
const sharedRoot = join(sourceRoot, "shared");

function sourceFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? sourceFiles(path) : /\.(js|jsx)$/.test(path) ? [path] : [];
    });
}

// Follow shared dependencies used by Warehouse without imposing its rules on other modules.
const graph = new Map();
function collect(path) {
    if (graph.has(path)) return;
    const source = readFileSync(path, "utf8");
    const imports = [...source.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["'](\.[^"']+)["']/g)]
        .map((match) => resolve(dirname(path), match[1]));
    graph.set(path, imports);
    for (const dependency of imports) {
        if (dependency.startsWith(sharedRoot + "/") && /\.(js|jsx)$/.test(dependency) && existsSync(dependency)) {
            collect(dependency);
        }
    }
}
for (const path of sourceFiles(moduleRoot)) collect(path);
collect(join(sharedRoot, "components/WarehouseWorkGuard.jsx"));

function localPath(path) {
    const sourcePath = relative(sourceRoot, path).split("\\").join("/");
    return sourcePath.replace(/^modules\/goods-receipt-packing\//, "");
}

test("Warehouse architecture: imports resolve and respect feature/layer boundaries", () => {
    for (const [file, imports] of graph) {
        const source = localPath(file);
        const parts = source.split("/");
        for (const target of imports) {
            const dependency = localPath(target);
            const message = `${source} -> ${dependency}`;
            assert.ok(existsSync(target), `Missing import: ${message}`);
            if (parts[0] === "shared") {
                assert.ok(dependency.startsWith("shared/"), `Shared must stay independent: ${message}`);
                if (["api", "schemas", "query"].includes(parts[1])) {
                    assert.ok(!/\/components\//.test(dependency), `Shared data must not depend on UI: ${message}`);
                }
            }
            if (parts[0] === "features") {
                assert.ok(
                    dependency.startsWith(`features/${parts[1]}/`) ||
                    dependency.startsWith("shared/") ||
                    dependency.startsWith("application/"),
                    `Features must not import sibling features or routing: ${message}`,
                );
                if (["api", "schemas", "queries"].includes(parts[2])) {
                    assert.ok(!dependency.startsWith("application/"), `Data layer must not depend on application: ${message}`);
                    assert.ok(!/\/(pages|components)\//.test(dependency), `Data layer must not depend on UI: ${message}`);
                }
            }
            if (parts[0] === "application") {
                assert.ok(
                    dependency.startsWith("application/") ||
                    dependency.startsWith("shared/") ||
                    /^features\/[^/]+\/api\//.test(dependency),
                    `Application composes feature APIs, not feature screens: ${message}`,
                );
            }
        }
    }
});

test("Warehouse architecture: no circular module dependencies", () => {
    const complete = new Set();
    const stack = [];
    function visit(path) {
        if (complete.has(path) || !graph.has(path)) return;
        assert.ok(!stack.includes(path), `Circular import: ${[...stack, path].map(localPath).join(" -> ")}`);
        stack.push(path);
        for (const dependency of graph.get(path)) {
            if ([".js", ".jsx"].includes(extname(dependency))) visit(dependency);
        }
        stack.pop();
        complete.add(path);
    }
    for (const path of graph.keys()) visit(path);
});
