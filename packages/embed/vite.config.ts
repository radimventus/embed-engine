import path from "node:path";

import { createEmbedViteConfig, rootDir } from "./vite.shared";

export default createEmbedViteConfig({
  emptyOutDir: true,
  entry: path.resolve(rootDir, "src/embed.bundle.ts"),
  formats: ["es"],
  fileName: "embed.es.js",
  exports: "named",
});
