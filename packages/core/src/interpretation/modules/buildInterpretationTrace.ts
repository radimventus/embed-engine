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
import { resolveSemanticRuleId } from "../rules/semanticRuleCatalog";
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
  partial: Omit<InterpretationTraceContribution, "confidenceFactors" | "ruleId"> & {
    readonly confidenceFactors?: readonly string[];
    readonly ruleMeaning?: string;
  },
): InterpretationTraceContribution {
  const ruleId =
    partial.ruleMeaning === undefined
      ? undefined
      : resolveSemanticRuleId(partial.ruleMeaning);

  const base: InterpretationTraceContribution = {
    id: partial.id,
    kind: partial.kind,
    module: partial.module,
    inputs: Object.freeze([...partial.inputs]),
    evidence: Object.freeze([...partial.evidence]),
    confidenceFactors: Object.freeze([...(partial.confidenceFactors ?? [])]),
  };

  if (ruleId === undefined) {
    return Object.freeze(base);
  }

  return Object.freeze({
    ...base,
    ruleId,
  });
}

function lensMeaning(lens: ResolvedLens): string {
  return lens === null ? "lens.baseline" : `lens.${lens}`;
}

/**
 * Builds a deterministic InterpretationTrace from module outputs.
 * Explainability only — does not alter semantic conclusions.
 * References SemanticRuleContract identities where catalogued.
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
      ruleMeaning: lensMeaning(input.lens),
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
        ruleMeaning: factor.code,
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
        ruleMeaning: factor.code,
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
        ruleMeaning: factor.code,
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
        ruleMeaning: item.code,
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
        ruleMeaning: item.code,
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
      ruleMeaning: `intent.${input.recommendedIntent}`,
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
