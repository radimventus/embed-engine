/**
 * CAP-DEV-02b — Shared CONIS Vite development logging controls.
 *
 * Env:
 * - CONIS_VITE_LOG_LEVEL — explicit Vite logLevel (info|warn|error|silent|…)
 * - CONIS_DEV_LAUNCHER=1 — canonical low-noise defaults (from `pnpm dev:conis`)
 *
 * When neither is set, returns {} so Vite keeps its built-in defaults.
 */

/**
 * @returns {{ logLevel?: string, clearScreen?: boolean }}
 */
export function conisViteDevLogging() {
  const explicit = process.env.CONIS_VITE_LOG_LEVEL?.trim();
  if (explicit !== undefined && explicit.length > 0) {
    const verbose =
      explicit === 'info' ||
      explicit === 'debug' ||
      explicit === 'trace';
    return {
      logLevel: explicit,
      clearScreen: verbose,
    };
  }

  if (process.env.CONIS_DEV_LAUNCHER === '1') {
    return {
      logLevel: 'warn',
      clearScreen: false,
    };
  }

  return {};
}
