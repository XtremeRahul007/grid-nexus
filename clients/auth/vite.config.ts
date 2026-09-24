import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "../../server/public/auth",
    emptyOutDir: true,
  },
  root: "./",
});
