import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { claudeDevPlugin } from "./claude-dev.mjs";
import environment from "vite-plugin-environment";

const ii_url =
  process.env.DFX_NETWORK === "local"
    ? `http://uqzsh-gqaaa-aaaaq-qaada-cai.localhost:8081/authorize`
    : `https://id.ai/authorize`;

process.env.II_URL = process.env.II_URL || ii_url;

// Match the deployed public-brand asset headers in local development/preview.
const brandHeaders = (req, res, next) => {
  const path = (req.url || "").split("?")[0];
  if (path === "/.well-known/ii-app-metadata") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (path === "/brand/common-thread-icon.png") {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  next();
};

export default defineConfig({
  logLevel: "error",
  build: {
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    { name: "common-thread-brand-metadata", configureServer(server) { server.middlewares.use(brandHeaders); }, configurePreviewServer(server) { server.middlewares.use(brandHeaders); } },
    claudeDevPlugin(loadEnv("development", process.cwd(), "ANTHROPIC_"), process.cwd()),
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
    environment({
      II_URL: process.env.II_URL,
      II_CANISTER_ID: process.env.II_CANISTER_ID || (new URL(process.env.II_URL || "https://id.ai").hostname === "beta.id.ai" ? "fgte5-ciaaa-aaaad-aaatq-cai" : "rdmx6-jaaaa-aaaaa-aaadq-cai"),
    }),
    react(),
  ],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"]
  },
});
