import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";
var packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
export default defineConfig({
    plugins: [react()],
    define: {
        __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    base: "./", // Critical for GitHub Pages
    server: {
        port: 3000,
        open: true, // Opens browser automatically
    },
    build: {
        outDir: "dist",
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes("node_modules")) {
                        if (id.includes("@google/genai")) {
                            return "vendor-genai";
                        }
                        // Merge all other dependencies to avoid circular references
                        return "vendor-libs";
                    }
                },
            },
        },
    },
});
