/**
 * Embed.unmount — tear down the active (or targeted) Embed session.
 *
 * Launcher Mode: Close Experience restores Host and re-arms the Launcher.
 * Unmount while only armed → unbind Launcher.
 */

import {
  getActiveSession,
  getArmedLauncher,
  setActiveSession,
  setArmedLauncher,
} from "./session";

function resolveHost(target?: string | HTMLElement): HTMLElement | null {
  if (target === undefined) {
    return getActiveSession()?.host ?? null;
  }

  if (typeof target === "string") {
    return document.querySelector<HTMLElement>(target);
  }

  return target;
}

function sessionKind(
  session: NonNullable<ReturnType<typeof getActiveSession>>,
): string | undefined {
  return "kind" in session ? String(session.kind) : undefined;
}

/**
 * Remove Embed UI from the host. If `target` is omitted, unmounts the active session.
 */
export function unmount(target?: string | HTMLElement): void {
  const session = getActiveSession();
  if (!session) {
    const armed = getArmedLauncher();
    if (armed) {
      armed.dispose();
      setArmedLauncher(null);
    }
    return;
  }

  const host = resolveHost(target);
  if (host && host !== session.host) {
    return;
  }

  const kind = sessionKind(session);

  if (kind === "client-studio-launcher") {
    session.dispose();
    setActiveSession(getArmedLauncher());
    return;
  }

  if (kind === "launcher-armed") {
    session.dispose();
    setArmedLauncher(null);
    setActiveSession(null);
    return;
  }

  session.dispose();
  setActiveSession(null);
}
