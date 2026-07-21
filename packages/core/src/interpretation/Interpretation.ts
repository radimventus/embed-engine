/**
 * Core Decision Architecture — Interpretation (ADR-012).
 *
 * Machine-readable meaning of an Object for a specific decision context.
 * Renderer-independent. Contains no presentation / localization fields.
 *
 * Distinct from Cognitive projection `Interpretation` (`@embed-engine/core/cognitive`).
 */

/**
 * Weighted machine factor (strength, friction, opportunity, …).
 * `code` is a stable machine key — not user-facing copy.
 */
export type InterpretationFactor = {
  readonly id: string;
  readonly code: string;
  readonly weight: number;
};

/**
 * Machine-readable trade-off between two codes.
 */
export type InterpretationTradeOff = {
  readonly id: string;
  readonly code: string;
  readonly favors: string;
  readonly against: string;
};

/**
 * Input contributing to confidence / match scoring.
 */
export type InterpretationConfidenceInput = {
  readonly id: string;
  readonly code: string;
  readonly contribution: number;
};

/**
 * Recommended decision intent — machine code, not UI label.
 */
export type InterpretationRecommendedIntent = string;

/**
 * Interpretation — first-class Core domain artifact (ADR-012).
 *
 * Facts → Meaning (this) → Communication (Experience) → Presentation (Renderers).
 */
export type Interpretation = {
  readonly id: string;
  readonly objectId: string;
  /** Selected Priority identifiers (machine ids — not UI labels). */
  readonly priorityIds: readonly string[];
  readonly strengths: readonly InterpretationFactor[];
  readonly frictions: readonly InterpretationFactor[];
  readonly opportunities: readonly InterpretationFactor[];
  readonly tradeOffs: readonly InterpretationTradeOff[];
  readonly confidenceInputs: readonly InterpretationConfidenceInput[];
  /** Integer match score in the range 0–100. */
  readonly matchScore: number;
  readonly recommendedIntent: InterpretationRecommendedIntent;
};

/**
 * Presentation fields that must never appear on Interpretation.
 * Used by domain tests — not a runtime filter.
 */
export const INTERPRETATION_FORBIDDEN_PRESENTATION_KEYS = Object.freeze([
  "title",
  "summary",
  "recommendations",
  "evidence",
  "concerns",
  "actions",
  "explanation",
  "label",
  "description",
] as const);

export function createInterpretation(
  input: Interpretation,
): Interpretation {
  return Object.freeze({
    id: input.id,
    objectId: input.objectId,
    priorityIds: Object.freeze([...input.priorityIds]),
    strengths: Object.freeze(input.strengths.map((item) => Object.freeze({ ...item }))),
    frictions: Object.freeze(input.frictions.map((item) => Object.freeze({ ...item }))),
    opportunities: Object.freeze(
      input.opportunities.map((item) => Object.freeze({ ...item })),
    ),
    tradeOffs: Object.freeze(input.tradeOffs.map((item) => Object.freeze({ ...item }))),
    confidenceInputs: Object.freeze(
      input.confidenceInputs.map((item) => Object.freeze({ ...item })),
    ),
    matchScore: input.matchScore,
    recommendedIntent: input.recommendedIntent,
  });
}
