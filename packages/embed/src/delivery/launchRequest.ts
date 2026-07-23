/**
 * Launch Request — architectural input to Delivery (EDIC-01 / LRI-01).
 */

import type { LaunchContext, ExperiencePresentationConfig } from "./presentation";

export type LaunchRequest = {
  readonly presentation: ExperiencePresentationConfig;
  readonly launchContext: LaunchContext;
  readonly objectId?: string;
  readonly assetBase?: string;
  /** Focus restore target after Close (Launcher control). */
  readonly restoreFocusTo?: HTMLElement | null;
};
