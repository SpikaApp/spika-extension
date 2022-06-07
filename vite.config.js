import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: ["es2020", "esnext"],
    module: "commonjs",
    target: "es2020",
  },

  server: {
    proxy: {
      "/api": {
        target: "https://fullnode.devnet.aptoslabs.com",
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
  plugins: [react()],
});
