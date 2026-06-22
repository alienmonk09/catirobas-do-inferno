import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // Served at https://alienmonk09.github.io/catirobas-do-inferno/ on GitHub Pages.
  // Keep root base during dev so the local server stays at "/".
  base: command === "build" ? "/catirobas-do-inferno/" : "/",
  test: {
    globals: true,
    environment: "node",
  },
}));
