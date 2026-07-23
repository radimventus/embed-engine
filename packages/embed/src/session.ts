/**
 * Active Embed session registry (single mount MVP).
 *
 * Launcher Mode may keep an armed binding while an Experience is Active.
 */

import type { EmbedSession } from "./bootstrap";
import type { LauncherArmedSession } from "./delivery/launchExperience";

let activeSession: EmbedSession | null = null;
let armedLauncher: LauncherArmedSession | null = null;

export function getActiveSession(): EmbedSession | null {
  return activeSession;
}

export function setActiveSession(session: EmbedSession | null): void {
  activeSession = session;
}

export function getArmedLauncher(): LauncherArmedSession | null {
  return armedLauncher;
}

export function setArmedLauncher(session: LauncherArmedSession | null): void {
  armedLauncher = session;
}
