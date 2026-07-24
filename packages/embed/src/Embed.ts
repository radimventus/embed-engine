/**
 * Public Embed SDK object — mount, unmount, version, build fingerprint.
 */

import { getEmbedRuntimeBuild } from "./buildFingerprint";
import { mount } from "./mount";
import { unmount } from "./unmount";
import { EMBED_VERSION } from "./version";

export const Embed = {
  mount,
  unmount,
  version: EMBED_VERSION,
  /** PT-DEPLOY-EMBED-01 — automatic Runtime build fingerprint. */
  build: getEmbedRuntimeBuild(),
} as const;

export type EmbedApi = typeof Embed;
