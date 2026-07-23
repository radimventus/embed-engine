/**
 * Embed demo — Launcher Experience Flow (PT-INTEGRATION-01).
 * Partner host → Hero CTA → Delivery overlay → Reveal → Close → Host restored.
 * No inline Client Studio mount on page load.
 */

import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed } from "../src/index";
import { registerClientStudioCss } from "../src/delivery/ensureStyles";

registerClientStudioCss(clientStudioCss);

Embed.mount({
  mode: "launcher",
  launcher: "#open-client-studio",
  objectId: "house-modern-01",
  hostId: "embed-demo-host",
  entryPoint: "hero-cta",
  launcherId: "open-client-studio",
});

console.info(
  `Embed Loader ${Embed.version} — Launcher Mode armed (no inline mount)`,
);
