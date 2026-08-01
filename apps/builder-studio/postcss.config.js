import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

const here = path.dirname(fileURLToPath(import.meta.url));
const tailwindConfig = path.join(here, "tailwind.config.js");

/**
 * Builder Studio PostCSS — pin local Tailwind config (builder + embed tokens).
 */
export default {
  plugins: [tailwindcss({ config: tailwindConfig }), autoprefixer()],
};
