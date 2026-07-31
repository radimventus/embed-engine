import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await build({
  absWorkingDir: root,
  entryPoints: [path.join(root, "src/browser.ts")],
  outfile: path.join(root, "dist/lead.iife.js"),
  bundle: true,
  format: "iife",
  globalName: "EmbedLead",
  platform: "browser",
  target: ["es2020"],
  minify: true,
});

console.log("✓ packages/lead/dist/lead.iife.js");
