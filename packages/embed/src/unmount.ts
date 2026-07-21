/**
 * Embed.unmount — tear down the active (or targeted) Embed session.
 */

import { getActiveSession, setActiveSession } from "./session";

function resolveHost(target?: string | HTMLElement): HTMLElement | null {
  if (target === undefined) {
    return getActiveSession()?.host ?? null;
  }

  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }

  return target;
}

/**
 * Remove Embed UI from the host. If `target` is omitted, unmounts the active session.
 */
export function unmount(target?: string | HTMLElement): void {
  const session = getActiveSession();
  if (!session) return;

  const host = resolveHost(target);
  if (host && host !== session.host) {
    return;
  }

  session.dispose();
  setActiveSession(null);
}
