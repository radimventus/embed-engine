/**
 * Embed demo — production Delivery Layer → Client Studio.
 * Uses Vite alias for Client Studio mount + inlined styles.
 */

import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed } from "../src/index";
import { registerClientStudioCss } from "../src/delivery/ensureStyles";

registerClientStudioCss(clientStudioCss);

Embed.mount({
  target: "#demo",
  objectId: "house-modern-01",
});

console.info(`Embed Loader ${Embed.version} mounted (Client Studio)`);
