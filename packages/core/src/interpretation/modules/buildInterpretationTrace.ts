import type {
  InterpretationConfidenceInput,
  InterpretationFactor,
  InterpretationRecommendedIntent,
  InterpretationTradeOff,
} from "../Interpretation";
import {
  createInterpretationTrace,
  type InterpretationTrace,
  type InterpretationTraceContribution,
} from "../InterpretationTrace";
import type { ResolvedLens } from "./lens";

export type BuildInterpretationTraceInput = {
  readonly interpretationId: string;
  readonly objectId: string;
  readonly lens: ResolvedLens;
  readonly lensKey: string;
  readonly priorityIds: readonly string[];
  readonly strengths: readonly InterpretationFactor[];
  readonly frictions: readonly InterpretationFactor[];
  readonly opportunities: readonly InterpretationFactor[];
  readonly tradeOffs: readonly InterpretationTradeOff[];
  readonly confidenceInputs: readonly InterpretationConfidenceInput[];
  readonly matchScore: number;
  readonly recommendedIntent: InterpretationRecommendedIntent;
};

function contribution(
  partial: Omit<InterpretationTraceContribution, "confidenceFactors"> & {
    readonly confidenceFactors?: readonly string[];
  },
): InterpretationTraceContribution {
  return Object.freeze({
    id: partial.id,
    kind: partial.kind,
    module: partial.module,
    inputs: Object.freeze([...partial.inputs]),
    evidence: Object.freeze([...partial.evidence]),
    confidenceFactors: Object.freeze([...(partial.confidenceFactors ?? [])]),
  });
}

/**
 * Builds a deterministic InterpretationTrace from module outputs.
 * Explainability only — does not alter semantic conclusions.
 */
export function buildInterpretationTrace(
  input: BuildInterpretationTraceInput,
): InterpretationTrace {
  const lensInput =
    input.lens === null ? "lens:none" : `lens:${input.lens}`;
  const priorityInputs = input.priorityIds.map((id) => `priority:${id}`);
  const moduleInputs = Object.freeze([lensInput, ...priorityInputs]);

  const contributions: InterpretationTraceContribution[] = [
    contribution({
      id: `lens.${input.lensKey}`,
      kind: "lens",
      module: "lens",
      inputs: priorityInputs,
      evidence: [lensInput],
    }),
  ];

  for (const factor of input.strengths) {
    contributions.push(
      contribution({
        id: factor.id,
        kind: "strength",
        module: "strengths",
        inputs: moduleInputs,
        evidence: [factor.code],
        confidenceFactors: [`weight:${factor.weight}`],
      }),
    );
  }

  for (const factor of input.frictions) {
    contributions.push(
      contribution({
        id: factor.id,
        kind: "friction",
        module: "frictions",
        inputs: moduleInputs,
        evidence: [factor.code],
        confidenceFactors: [`weight:${factor.weight}`],
      }),
    );
  }

  for (const factor of input.opportunities) {
    contributions.push(
      contribution({
        id: factor.id,
        kind: "opportunity",
        module: "opportunities",
        inputs: moduleInputs,
        evidence: [factor.code],
        confidenceFactors: [`weight:${factor.weight}`],
      }),
    );
  }

  for (const item of input.tradeOffs) {
    contributions.push(
      contribution({
        id: item.id,
        kind: "tradeOff",
        module: "tradeOffs",
        inputs: moduleInputs,
        evidence: [item.code, `favors:${item.favors}`, `against:${item.against}`],
      }),
    );
  }

  for (const item of input.confidenceInputs) {
    contributions.push(
      contribution({
        id: item.id,
        kind: "confidence",
        module: "confidence",
        inputs: moduleInputs,
        evidence: [item.code],
        confidenceFactors: [
          `contribution:${item.contribution}`,
          `matchScore:${input.matchScore}`,
        ],
      }),
    );
  }

  contributions.push(
    contribution({
      id: `intent.${input.recommendedIntent}`,
      kind: "intent",
      module: "intent",
      inputs: moduleInputs,
      evidence: [`intent:${input.recommendedIntent}`],
    }),
  );

  return createInterpretationTrace({
    interpretationId: input.interpretationId,
    objectId: input.objectId,
    modules: Object.freeze([
      "lens",
      "strengths",
      "frictions",
      "opportunities",
      "tradeOffs",
      "confidence",
      "intent",
      "assembleInterpretation",
    ]),
    contributions: Object.freeze(contributions),
    metadata: Object.freeze({
      producer: "InterpretationEngine",
      schemaVersion: 1,
      lensKey: input.lensKey,
    }),
  });
}
