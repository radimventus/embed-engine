/**
 * Vite IIFE entry: Client Studio styles + default Embed export for window.Embed.
 */

import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed } from "./Embed";
import { registerClientStudioCss } from "./delivery/ensureStyles";

registerClientStudioCss(clientStudioCss);

export default Embed;
