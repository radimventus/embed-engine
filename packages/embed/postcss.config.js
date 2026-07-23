import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

import embedBoundaryUtilities from "./postcss-embed-boundary-utilities.js";

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [tailwindcss(), embedBoundaryUtilities(), autoprefixer()],
};
