import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "path";

export default defineConfig({
  plugins: [reactRouter()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
  ssr: {
    noExternal: [],
    external: ["@node-rs/argon2"],
  },
  optimizeDeps: {
    exclude: ["@node-rs/argon2"],
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: true,
  },
});
