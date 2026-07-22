/**
 * Vite library entry: Client Studio styles + Embed public API.
 * Node unit tests import `./index` / `./Embed` and never load CSS.
 */

import clientStudioCss from "../../../apps/client-studio/src/index.css?inline";

import { Embed } from "./Embed";
import { registerClientStudioCss } from "./delivery/ensureStyles";

registerClientStudioCss(clientStudioCss);

export { Embed };
export type { EmbedApi } from "./Embed";
export type {
  EmbedMountOptions,
  EmbedProductionMountOptions,
  EmbedLegacyMountOptions,
  EmbedLegacyFixtureId,
} from "./delivery/types";
/** @deprecated Prefer EmbedLegacyFixtureId */
export type { EmbedFixtureId } from "./fixtures";

export default Embed;
