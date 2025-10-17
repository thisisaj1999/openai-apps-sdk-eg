import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path"
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  root: "host",
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: "host/index.html",
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
