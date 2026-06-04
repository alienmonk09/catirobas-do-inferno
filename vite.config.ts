import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Served at https://alienmonk09.github.io/ashen-banner/ on GitHub Pages.
  // Keep root base during dev so the local server stays at "/".
  base: command === "build" ? "/ashen-banner/" : "/",
  test: {
    globals: true,
    environment: "node",
  },
}));
