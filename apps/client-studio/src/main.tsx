/**
 * SSOT Local host — Client Studio is not a parallel product.
 *
 * Experience mounts exclusively through Embed.mount → Delivery → mountClientStudio.
 */

import clientStudioCss from "./index.css?inline";

import { Embed, registerClientStudioCss } from "@embed-engine/embed";

import { mountClientHostWorkspaceNavigation } from "./host/mountClientHostWorkspaceNavigation";

registerClientStudioCss(clientStudioCss);

mountClientHostWorkspaceNavigation();

Embed.mount({
  mode: "launcher",
  launcher: "#open-client-studio",
  objectId: "house-modern-01",
  hostId: "client-studio-local-host",
  entryPoint: "hero-cta",
  launcherId: "open-client-studio",
});

console.info(
  `SSOT Local host — Embed ${Embed.version} (launcher; same Runtime as Embed demo)`,
);
