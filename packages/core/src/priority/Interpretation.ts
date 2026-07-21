/**
 * Priority Domain Model §2.8 — Interpretation.
 *
 * Machine-readable meaning (ADR-012 Core artifact).
 * Contains no UI wording, presentation, or formatting.
 *
 * Open Question DM-OQ-04: alignment with Cognitive projection `Interpretation`
 * (CORE-101 / ADR-006) — not unified here; Needs follow-up ADR if contracts must merge.
 *
 * Representation: existing Core Interpretation contract.
 */

export type {
  Interpretation,
  InterpretationConfidenceInput,
  InterpretationFactor,
  InterpretationRecommendedIntent,
  InterpretationTradeOff,
} from "../interpretation/Interpretation";
