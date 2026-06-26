import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
                rewrite: function (path) { return path.replace(/^\/api/, ""); },
            },
            "/ws": {
                target: "ws://localhost:3000",
                ws: true,
            },
        },
    },
});
