/**
 * @embed-engine/embed — public Embed Loader SDK.
 *
 * Public surface: Embed.mount / Embed.unmount / Embed.version
 */

export { Embed } from "./Embed";
export type { EmbedApi } from "./Embed";
export type {
  EmbedMountOptions,
  EmbedProductionMountOptions,
  EmbedLegacyMountOptions,
  EmbedLegacyFixtureId,
  ExperienceMode,
} from "./delivery/types";
export type { LaunchContext, ExperiencePresentationConfig } from "./delivery/presentation";
/** Host CSS injection — Local / Embed demo register Client Studio styles once. */
export { registerClientStudioCss } from "./delivery/ensureStyles";
/** @deprecated Prefer EmbedLegacyFixtureId */
export type { EmbedFixtureId } from "./fixtures";

import { Embed } from "./Embed";
export default Embed;
