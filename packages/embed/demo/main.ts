/**
 * Embed demo — Launcher Mode foundation (LRI-01).
 * Partner-like host page → CTA → Delivery overlay → Client Studio.
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
  `Embed Loader ${Embed.version} — Launcher armed (click #open-client-studio)`,
);
