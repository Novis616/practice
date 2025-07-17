import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/practice/",

  // Убираем проблемную конфигурацию build
  build: {
    outDir: "dist",
  },

  server: {
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
});
