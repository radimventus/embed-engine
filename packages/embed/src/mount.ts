/**
 * Embed.mount — public entry.
 *
 * Production: Delivery Layer → Client Studio (wired in subsequent milestone).
 * Legacy: explicit `fixture: "garden"` or `experience` → Priority HTML renderer.
 */

import { bootstrapLegacyGardenEmbed } from "./delivery/legacyGarden";
import {
  isLegacyExperienceMount,
  isLegacyGardenMount,
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
 *
 * Production path (no fixture): prepared for Client Studio mounting.
 * Until Client Studio mount is wired, production options throw a clear error
 * so Garden is never an implicit fallback.
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

  throw new Error(
    'Embed.mount production Client Studio path is not wired yet. Pass { fixture: "garden" } for legacy Priority Journey, or wait for Client Studio delivery mount.',
  );
}

export type { EmbedMountOptions };
