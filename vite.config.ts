import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/phaser")) return "phaser-vendor";
          if (id.includes("node_modules")) return "vendor";
        }
      }
    }
  },
  plugins: [
    {
      name: "root-index-fallback",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === "/") req.url = "/index.html";
          next();
        });
      }
    }
  ],
  server: {
    host: "127.0.0.1",
    port: 5188,
    strictPort: true
  },
  preview: {
    host: "127.0.0.1",
    port: 5188,
    strictPort: true
  }
});
