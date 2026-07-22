import { PILOT_FLAGS, PILOT_LEAD_MAILTO } from './pilotVocabulary';

/**
 * Production configuration surface for Client Studio pilot (CSCB-09).
 *
 * Values are compile-time defaults. Environment overrides are limited to
 * legacy opt-in only — see Configuration Guide.
 */
export const CLIENT_STUDIO_RELEASE = {
  /** Package version — injected at build time when available. */
  version:
    typeof __CLIENT_STUDIO_VERSION__ !== 'undefined'
      ? __CLIENT_STUDIO_VERSION__
      : '0.1.0',
  /** Product label for support / diagnostics (not Runtime semantics). */
  product: 'Client Studio',
  generation: '1',
} as const;

export const PRODUCTION_DEFAULTS = {
  /** Legacy Command Runtime must stay off for certified pilot path. */
  legacyCommandRuntime: false,
  /** Lead transport for Generation 1 pilot. */
  leadCaptureMode: PILOT_FLAGS.leadCaptureMode,
  leadMailto: PILOT_LEAD_MAILTO,
  /**
   * AI Advisor section visibility. Chat replies remain placeholder until
   * CSCB-06 LLM wiring — FAQ / intro still project Runtime AIContext.
   */
  showAiAdvisor: PILOT_FLAGS.showAiAdvisor,
  /**
   * Production analytics sink is in-memory only unless a remote adapter
   * is wired at composition root (no customer PII / Runtime dumps).
   */
  analyticsRemoteExport: false,
  /** Source maps are disabled in production builds (see vite.config). */
  sourceMapsInProduction: false,
} as const;

/** Safe diagnostic identifiers — never include session payloads or PII. */
export function buildSupportDiagnostics(): {
  readonly product: string;
  readonly version: string;
  readonly generation: string;
  readonly leadMode: string;
  readonly aiAdvisorVisible: boolean;
} {
  return {
    product: CLIENT_STUDIO_RELEASE.product,
    version: CLIENT_STUDIO_RELEASE.version,
    generation: CLIENT_STUDIO_RELEASE.generation,
    leadMode: PRODUCTION_DEFAULTS.leadCaptureMode,
    aiAdvisorVisible: PRODUCTION_DEFAULTS.showAiAdvisor,
  };
}
