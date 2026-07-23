import path from "node:path";
import { fileURLToPath } from "node:url";

import clientStudioConfig from "../../apps/client-studio/tailwind.config.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const clientStudio = path.join(repoRoot, "apps/client-studio");
const uiSrc = path.join(repoRoot, "packages/ui/src");
const embedSrc = path.join(here, "src");

/**
 * Embed Delivery Tailwind config.
 *
 * Reuses Client Studio theme (design tokens) but overrides `content` with
 * absolute globs. Relative `./src/**` in the Client Studio config resolves
 * against `packages/embed` CWD during the Embed Vite build and misses almost
 * all Experience classes — causing collapsed layout / missing Hero styles.
 *
 * PT-EMBED-02A isolation:
 * - `important: true` — utilities emit `!important` so they beat host theme
 *   `a { color: … !important }` when specificity is otherwise equal/lower.
 * - `important: '[data-embed-boundary]'` would only raise specificity; WordPress
 *   / Elementor still win with tag+!important. True + Delivery isolation CSS
 *   (CTA hooks) together harden partner embeds.
 */
/** @type {import('tailwindcss').Config} */
export default {
  ...clientStudioConfig,
  important: true,
  content: [
    path.join(clientStudio, "index.html"),
    path.join(clientStudio, "src/**/*.{js,ts,jsx,tsx}"),
    path.join(uiSrc, "**/*.{js,ts,jsx,tsx}"),
    path.join(embedSrc, "**/*.{js,ts,jsx,tsx}"),
  ],
};
