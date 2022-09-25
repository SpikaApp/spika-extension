import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import nodePolyfills from "rollup-plugin-node-polyfills";

export default defineConfig({
  resolve: {
    alias: {
      process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      events: "rollup-plugin-node-polyfills/polyfills/events",
      util: "rollup-plugin-node-polyfills/polyfills/util",
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },
  },
  build: {
    // minify: false,
    // sourcemap: true,
    // commonjsOptions: {
    //   include: /node_modules/,
    //   transformMixedEsModules: true,
    // },
    rollupOptions: {
      output: {
        entryFileNames: "app/[name].js",
        chunkFileNames: "app/[name].js",
        assetFileNames: "app/assets/[name].[ext]",
      },
      plugins: [nodePolyfills()],
    },
    module: "commonjs",
    target: "es2020",
    chunkSizeWarningLimit: 2048,
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 8080,
  },
  plugins: [react({ fastRefresh: true })],
});
