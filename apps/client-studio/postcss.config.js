import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

import embedBoundaryUtilities from "../../packages/embed/postcss-embed-boundary-utilities.js";

/** SSOT Local host must use the same CSS scoping pipeline as Embed hosts. */
export default {
  plugins: [tailwindcss(), embedBoundaryUtilities(), autoprefixer()],
};
