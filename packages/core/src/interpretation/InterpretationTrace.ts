/**
 * InterpretationTrace — explainability artifact for Interpretation (ADR-012).
 *
 * Answers "why" an Interpretation was produced.
 * Renderer-independent. No UI / localization / presentation fields.
 */

export type InterpretationTraceConclusionKind =
  | "lens"
  | "strength"
  | "friction"
  | "opportunity"
  | "tradeOff"
  | "confidence"
  | "intent";

/**
 * One traced semantic conclusion (factor, trade-off, score, intent, …).
 */
export type InterpretationTraceContribution = {
  readonly id: string;
  readonly kind: InterpretationTraceConclusionKind;
  /** Semantic module that produced the conclusion. */
  readonly module: string;
  /** Machine input keys that influenced the conclusion. */
  readonly inputs: readonly string[];
  /** Machine evidence codes (typically factor / rule codes). */
  readonly evidence: readonly string[];
  /** Optional confidence-related machine keys. */
  readonly confidenceFactors: readonly string[];
};

/**
 * Execution metadata for the interpretation run.
 * Extensible for future rule / AI enrichment without public API breaks.
 */
export type InterpretationTraceMetadata = {
  readonly producer: "InterpretationEngine";
  readonly schemaVersion: 1;
  /** Active lens key used for assembly (`baseline` when none). */
  readonly lensKey: string;
};

/**
 * Structured explanation of how an Interpretation was produced.
 */
export type InterpretationTrace = {
  readonly interpretationId: string;
  readonly objectId: string;
  /** Modules that contributed to this Interpretation. */
  readonly modules: readonly string[];
  readonly contributions: readonly InterpretationTraceContribution[];
  readonly metadata: InterpretationTraceMetadata;
};

export const INTERPRETATION_TRACE_FORBIDDEN_PRESENTATION_KEYS = Object.freeze([
  "title",
  "summary",
  "label",
  "description",
  "explanation",
  "message",
  "copy",
] as const);

function freezeContribution(
  item: InterpretationTraceContribution,
): InterpretationTraceContribution {
  return Object.freeze({
    id: item.id,
    kind: item.kind,
    module: item.module,
    inputs: Object.freeze([...item.inputs]),
    evidence: Object.freeze([...item.evidence]),
    confidenceFactors: Object.freeze([...item.confidenceFactors]),
  });
}

/**
 * Freezes an InterpretationTrace for attachment to Interpretation.
 */
export function createInterpretationTrace(
  input: InterpretationTrace,
): InterpretationTrace {
  return Object.freeze({
    interpretationId: input.interpretationId,
    objectId: input.objectId,
    modules: Object.freeze([...input.modules]),
    contributions: Object.freeze(
      input.contributions.map((item) => freezeContribution(item)),
    ),
    metadata: Object.freeze({
      producer: input.metadata.producer,
      schemaVersion: input.metadata.schemaVersion,
      lensKey: input.metadata.lensKey,
    }),
  });
}
