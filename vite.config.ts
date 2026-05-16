import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    optimizeDeps: {
        include: ["lottie-web"],
    },
    build: {
        // Increase warning threshold slightly (app has many icons)
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Manual chunk splitting for predictable caching and parallel loading
                manualChunks(id) {
                    // Core React runtime — tiny, cached forever
                    if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
                        return "react-core";
                    }
                    // Router — small, stable
                    if (id.includes("node_modules/react-router")) {
                        return "router";
                    }
                    // State + data fetching
                    if (id.includes("node_modules/zustand") || id.includes("node_modules/@tanstack")) {
                        return "state";
                    }
                    // Heavy exam components (lazy-loaded pages pull these in on demand)
                    if (id.includes("node_modules/framer-motion") || id.includes("node_modules/motion")) {
                        return "motion";
                    }
                    if (id.includes("node_modules/recharts")) {
                        return "charts";
                    }
                    if (id.includes("node_modules/plyr")) {
                        return "plyr";
                    }
                    // Icons library — large but tree-shaken; keep together for cache efficiency
                    if (id.includes("node_modules/@untitledui")) {
                        return "icons";
                    }
                    if (id.includes("node_modules/lucide")) {
                        return "lucide";
                    }
                    // Everything else in node_modules → vendor chunk
                    if (id.includes("node_modules/")) {
                        return "vendor";
                    }
                },
            },
        },
    },
    server: {
        host: true,
        port: 5173,
        strictPort: true,
        allowedHosts: [
            "localhost",
            ".trycloudflare.com",
            ".ngrok.io",
        ],
    },
});
