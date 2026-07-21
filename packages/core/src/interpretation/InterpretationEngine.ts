import type { Interpretation } from "./Interpretation";
import { assembleInterpretation } from "./modules/assembleInterpretation";
import { resolveConfidence } from "./modules/confidence";
import { resolveFrictions } from "./modules/frictions";
import { resolveIntent } from "./modules/intent";
import { lensKeyFor, resolveLens } from "./modules/lens";
import { resolveOpportunities } from "./modules/opportunities";
import { resolveStrengths } from "./modules/strengths";
import { resolveTradeOffs } from "./modules/tradeOffs";

export type InterpretObjectInput = {
  readonly objectId: string;
  readonly priorityIds: readonly string[];
};

/**
 * Canonical Core producer of Interpretation (ADR-012).
 * Orchestrates semantic modules — no Experience, UI, localization, or renderers.
 */
export type InterpretationEngine = {
  readonly interpret: (input: InterpretObjectInput) => Interpretation;
};

/**
 * Creates an InterpretationEngine that coordinates focused semantic modules.
 */
export function createInterpretationEngine(): InterpretationEngine {
  return Object.freeze({
    interpret(input: InterpretObjectInput): Interpretation {
      const lens = resolveLens(input.priorityIds);
      const confidence = resolveConfidence(lens);

      return assembleInterpretation({
        objectId: input.objectId,
        priorityIds: input.priorityIds,
        lens,
        lensKey: lensKeyFor(lens),
        strengths: resolveStrengths(lens),
        frictions: resolveFrictions(lens),
        opportunities: resolveOpportunities(lens),
        tradeOffs: resolveTradeOffs(lens),
        confidenceInputs: confidence.confidenceInputs,
        matchScore: confidence.matchScore,
        recommendedIntent: resolveIntent(lens),
      });
    },
  });
}

/** Shared runtime instance — single canonical Interpretation producer. */
export const interpretationEngine: InterpretationEngine =
  createInterpretationEngine();
