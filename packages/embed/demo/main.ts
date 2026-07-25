/**
 * Embed demo — SSOT development host.
 * Same Embed.mount path as Local Client Studio host.
 */

import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed, registerClientStudioCss } from "../src/index";

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
  `SSOT Embed demo — Embed ${Embed.version} (launcher; same Runtime as Local host)`,
);
