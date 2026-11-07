import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, ".", "");
    const target = env.WAREHOUSE_PROXY_TARGET || "http://localhost:8080";
    return {
        plugins: [react()],
        server: {
            proxy: {
                "/api/v1": { target, changeOrigin: true },
                "/catalog-api": {
                    target,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/catalog-api/, "/api/v1"),
                },
            },
        },
    };
});
