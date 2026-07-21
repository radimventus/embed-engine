/**
 * Active Embed session registry (single mount MVP).
 *
 * TODO(ADR): multi-instance Embed mounts on one page.
 */

import type { EmbedSession } from "./bootstrap";

let activeSession: EmbedSession | null = null;

export function getActiveSession(): EmbedSession | null {
  return activeSession;
}

export function setActiveSession(session: EmbedSession | null): void {
  activeSession = session;
}
