import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa"; // IMPORT ADDED
import { readFileSync } from "fs";
var packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));
export default defineConfig({
  plugins: [
    react(),
    // PWA CONFIGURATION ADDED HERE
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "Mission Architect for DCS",
        short_name: "Mission Architect",
        description: "Mission planning tool for DCS World",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  // CHANGED: Use the repo name for GitHub Pages stability.
  // "./" can break if you use React Router on sub-pages.
  base: "/Mission-Architect-for-DCS-World/",
  server: {
    port: 3000,
    open: false,
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
