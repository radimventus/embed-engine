import path from 'node:path';
import { fileURLToPath } from 'node:url';

import autoprefixer from 'autoprefixer';
import tailwindcss from 'tailwindcss';

const here = path.dirname(fileURLToPath(import.meta.url));
const tailwindConfig = path.join(here, 'tailwind.config.js');

/** ARCH-01 — pin Workspace Host Tailwind so Client Studio CSS ?inline resolves. */
export default {
  plugins: [tailwindcss({ config: tailwindConfig }), autoprefixer()],
};
