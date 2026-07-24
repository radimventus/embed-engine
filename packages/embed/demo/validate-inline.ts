/**
 * PT-EMBED-RUNTIME-INTEGRATION-01 — inline mount for live Runtime proof (no launcher click).
 */
import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed } from "../src/index";
import { registerClientStudioCss } from "../src/delivery/ensureStyles";

registerClientStudioCss(clientStudioCss);

Embed.mount({
  mode: "inline",
  target: "#embed-host",
  objectId: "house-modern-01",
});
