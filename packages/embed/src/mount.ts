/**
 * Embed.mount — public entry: Host → Loader → Runtime → HTML Renderer.
 */

import { bootstrapEmbed } from "./bootstrap";
import {
  resolveEngineEvents,
  resolveJourneyFixture,
  type EmbedMountOptions,
} from "./fixtures";
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
 * Mount Priority Experience into a host element.
 * Replaces any previously active Embed session.
 */
export function mount(options: EmbedMountOptions): void {
  if (getActiveSession()) {
    unmount();
  }

  const host = resolveTarget(options.target);
  const fixture = resolveJourneyFixture(options);
  const engineEvents = resolveEngineEvents(options, fixture);
  const session = bootstrapEmbed(host, fixture, engineEvents);
  setActiveSession(session);
}

export type { EmbedMountOptions };
