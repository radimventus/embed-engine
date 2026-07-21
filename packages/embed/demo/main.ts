/**
 * Embed demo — public API only. No Runtime / Renderer imports.
 */

import { Embed } from "../src/index";

Embed.mount({
  target: "#demo",
  fixture: "garden",
});

console.info(`Embed Loader ${Embed.version} mounted`);
