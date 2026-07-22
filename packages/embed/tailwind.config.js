import path from "node:path";
import { fileURLToPath } from "node:url";

import clientStudioConfig from "../../apps/client-studio/tailwind.config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const clientStudio = path.join(repoRoot, "apps/client-studio");
const uiSrc = path.join(repoRoot, "packages/ui/src");

/**
 * Embed Delivery Tailwind config.
 *
 * Reuses Client Studio theme (design tokens) but overrides `content` with
 * absolute globs. Relative `./src/**` in the Client Studio config resolves
 * against `packages/embed` CWD during the Embed Vite build and misses almost
 * all Experience classes — causing collapsed layout / missing Hero styles.
 */
/** @type {import('tailwindcss').Config} */
export default {
  ...clientStudioConfig,
  content: [
    path.join(clientStudio, "index.html"),
    path.join(clientStudio, "src/**/*.{js,ts,jsx,tsx}"),
    path.join(uiSrc, "**/*.{js,ts,jsx,tsx}"),
  ],
};
