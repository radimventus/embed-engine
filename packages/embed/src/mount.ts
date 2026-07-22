/**
 * Embed.mount — public entry.
 *
 * Production: Delivery Layer → Object Package → Runtime → ClientStudioApp.
 * Legacy: explicit `fixture: "garden"` or `experience` → Priority HTML renderer.
 */

import { bootstrapLegacyGardenEmbed } from "./delivery/legacyGarden";
import { bootstrapClientStudioDelivery } from "./delivery/mountClientStudioDelivery";
import {
  isLegacyExperienceMount,
  isLegacyGardenMount,
  isProductionMount,
  type EmbedMountOptions,
} from "./delivery/types";
import { resolveEngineEvents, resolveJourneyFixture } from "./fixtures";
import { getActiveSession, setActiveSession } from "./session";
import { unmount } from "./unmount";

function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector<HTMLElement>(target);
  if (!element) {
    throw new Error(`Embed.mount: target not found: ${target}`);
  }
  return element;
}

/**
 * Mount Embed into a host element.
 * Replaces any previously active Embed session.
 */
export function mount(options: EmbedMountOptions): void {
  if (getActiveSession()) {
    unmount();
  }

  const host = resolveTarget(options.target);

  if (isLegacyGardenMount(options) || isLegacyExperienceMount(options)) {
    const fixture = resolveJourneyFixture(options);
    const engineEvents = resolveEngineEvents(options, fixture);
    const session = bootstrapLegacyGardenEmbed(host, fixture, engineEvents);
    setActiveSession(session);
    return;
  }

  if (isProductionMount(options)) {
    const session = bootstrapClientStudioDelivery(host, options);
    setActiveSession(session);
    return;
  }

  throw new Error("Embed.mount: unsupported mount options");
}

export type { EmbedMountOptions };
