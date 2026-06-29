import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths so the built app loads correctly from file:// inside Electron.
  base: "./",
  plugins: [react()],
  server: {
    // Forward API calls to the Node/SQLite backend during development.
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
});
