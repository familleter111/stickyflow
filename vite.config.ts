import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative paths so the built app loads correctly from file:// inside Electron.
  base: "./",
  plugins: [react()],
});
