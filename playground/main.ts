/**
 * SSOT playground host — same Embed.mount path as Local / Embed demo.
 * Never loads packages/embed/dist IIFE (frozen artifact path removed).
 */

import clientStudioCss from "../apps/client-studio/src/index.css?inline";

import { Embed, registerClientStudioCss } from "@embed-engine/embed";

registerClientStudioCss(clientStudioCss);

Embed.mount({
  mode: "launcher",
  launcher: "#open-client-studio",
  objectId: "house-modern-01",
  hostId: "playground-host",
  entryPoint: "hero-cta",
  launcherId: "open-client-studio",
});

console.info(
  `SSOT playground — Embed ${Embed.version} (live source; same Runtime as Local)`,
);
