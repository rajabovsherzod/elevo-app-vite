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
    server: {
        // Cloudflare tunnel va boshqa tashqi hostlarga ruxsat berish (Django ALLOWED_HOSTS=['*'] kabi)
        allowedHosts: true,
        host: true,
    },
});
