import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

const repoBase = process.env.VITE_BASE_PATH ?? "/Language/";

export default defineConfig({
  base: repoBase,
  plugins: [
    react(),
    {
      name: "copy-curriculum-data",
      buildStart() {
        const src = resolve(__dirname, "../data/curriculum.json");
        const destDir = resolve(__dirname, "public/data");
        if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });
        copyFileSync(src, resolve(destDir, "curriculum.json"));
      },
    },
  ],
  publicDir: "public",
});
