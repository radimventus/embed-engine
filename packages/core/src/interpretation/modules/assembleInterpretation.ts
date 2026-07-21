import {
  createInterpretation,
  type Interpretation,
  type InterpretationConfidenceInput,
  type InterpretationFactor,
  type InterpretationRecommendedIntent,
  type InterpretationTradeOff,
} from "../Interpretation";

export type AssembleInterpretationInput = {
  readonly objectId: string;
  readonly priorityIds: readonly string[];
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
 */
export function assembleInterpretation(
  input: AssembleInterpretationInput,
): Interpretation {
  return createInterpretation({
    id: `interpretation.${input.objectId}.${input.lensKey}`,
    objectId: input.objectId,
    priorityIds: input.priorityIds,
    strengths: input.strengths,
    frictions: input.frictions,
    opportunities: input.opportunities,
    tradeOffs: input.tradeOffs,
    confidenceInputs: input.confidenceInputs,
    matchScore: input.matchScore,
    recommendedIntent: input.recommendedIntent,
  });
}
