/**
 * Public Embed SDK object — only mount, unmount, version.
 */

import { mount } from "./mount";
import { unmount } from "./unmount";
import { EMBED_VERSION } from "./version";

export const Embed = {
  mount,
  unmount,
  version: EMBED_VERSION,
} as const;

export type EmbedApi = typeof Embed;
