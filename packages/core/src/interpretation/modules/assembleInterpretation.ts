import {
  createInterpretation,
  type Interpretation,
  type InterpretationConfidenceInput,
  type InterpretationFactor,
  type InterpretationRecommendedIntent,
  type InterpretationTradeOff,
} from "../Interpretation";
import { buildInterpretationTrace } from "./buildInterpretationTrace";
import type { ResolvedLens } from "./lens";

export type AssembleInterpretationInput = {
  readonly objectId: string;
  readonly priorityIds: readonly string[];
  readonly lens: ResolvedLens;
  readonly lensKey: string;
  readonly strengths: readonly InterpretationFactor[];
  readonly frictions: readonly InterpretationFactor[];
  readonly opportunities: readonly InterpretationFactor[];
  readonly tradeOffs: readonly InterpretationTradeOff[];
  readonly confidenceInputs: readonly InterpretationConfidenceInput[];
  readonly matchScore: number;
  readonly recommendedIntent: InterpretationRecommendedIntent;
};

/**
 * Assembles a frozen Interpretation from module outputs.
 * No semantic decisions — orchestration only.
 * Attaches InterpretationTrace for explainability.
 */
export function assembleInterpretation(
  input: AssembleInterpretationInput,
): Interpretation {
  const id = `interpretation.${input.objectId}.${input.lensKey}`;
  const trace = buildInterpretationTrace({
    interpretationId: id,
    objectId: input.objectId,
    lens: input.lens,
    lensKey: input.lensKey,
    priorityIds: input.priorityIds,
    strengths: input.strengths,
    frictions: input.frictions,
    opportunities: input.opportunities,
    tradeOffs: input.tradeOffs,
    confidenceInputs: input.confidenceInputs,
    matchScore: input.matchScore,
    recommendedIntent: input.recommendedIntent,
  });

  return createInterpretation({
    id,
    objectId: input.objectId,
    priorityIds: input.priorityIds,
    strengths: input.strengths,
    frictions: input.frictions,
    opportunities: input.opportunities,
    tradeOffs: input.tradeOffs,
    confidenceInputs: input.confidenceInputs,
    matchScore: input.matchScore,
    recommendedIntent: input.recommendedIntent,
    trace,
  });
}
