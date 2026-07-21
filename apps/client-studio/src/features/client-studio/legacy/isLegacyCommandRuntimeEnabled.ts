/**
 * Explicit opt-in for quarantined CommandRuntime Experience (EX-04).
 * Default: OFF — Cognitive Runtime is the only demo path.
 *
 * Enable via any of:
 * - URL `?legacyCommandRuntime=1`
 * - localStorage `embed.enableLegacyCommandRuntime=1`
 * - env `VITE_ENABLE_LEGACY_COMMAND_RUNTIME=true`
 */
export function isLegacyCommandRuntimeEnabled(): boolean {
  if (typeof window !== 'undefined') {
    try {
      if (
        new URLSearchParams(window.location.search).get('legacyCommandRuntime') ===
        '1'
      ) {
        return true;
      }
      if (window.localStorage.getItem('embed.enableLegacyCommandRuntime') === '1') {
        return true;
      }
    } catch {
      // ignore storage / URL access errors
    }
  }

  return import.meta.env.VITE_ENABLE_LEGACY_COMMAND_RUNTIME === 'true';
}
