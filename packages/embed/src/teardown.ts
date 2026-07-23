/**
 * Hard teardown — used before a new Embed.mount (replaces any armed Launcher + Active Experience).
 */

import {
  getActiveSession,
  getArmedLauncher,
  setActiveSession,
  setArmedLauncher,
} from "./session";

export function teardownEmbed(): void {
  const active = getActiveSession();
  if (active) {
    active.dispose();
  }
  const armed = getArmedLauncher();
  if (armed) {
    // Avoid double-unbind if active was the armed session.
    if (active !== armed) {
      armed.dispose();
    }
  }
  setArmedLauncher(null);
  setActiveSession(null);
}
