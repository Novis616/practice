import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/practice/",
  build: {
    rollupOptions: {
      input: {
        main: "./index.html",
        sw: "./public/sw.js",
      },
    },
  },

  server: {
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
});
