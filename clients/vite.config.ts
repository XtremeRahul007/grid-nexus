import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: "/var/www/grid-nexus",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: "./index.html",
        auth: "./auth/index.html",
      },
    },
  },
  root: "./",
});
