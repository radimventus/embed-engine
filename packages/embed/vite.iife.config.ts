import path from "node:path";

import { createEmbedViteConfig, rootDir } from "./vite.shared";

export default createEmbedViteConfig({
  emptyOutDir: false,
  entry: path.resolve(rootDir, "src/iife.bundle.ts"),
  formats: ["iife"],
  fileName: "embed.iife.js",
  libName: "Embed",
  exports: "default",
});
