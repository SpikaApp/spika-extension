import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "app/[name].js",
        chunkFileNames: "app/[name].js",
        assetFileNames: "app/assets/[name].[ext]",
      },
    },
    module: "commonjs",
    target: "es2020",
    chunkSizeWarningLimit: 1024,
  },

  server: {
    proxy: {
      "/api": {
        target: "https://fullnode.devnet.aptoslabs.com/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/faucet": {
        target: "https://faucet.devnet.aptoslabs.com",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/faucet/, ""),
      },
    },
  },
  plugins: [react({ fastRefresh: true })],
});
