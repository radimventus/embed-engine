import type { Interpretation } from "./Interpretation";
import {
  createDecisionContext,
  type DecisionContext,
} from "./DecisionContext";
import { assembleInterpretation } from "./modules/assembleInterpretation";
import { resolveConfidence } from "./modules/confidence";
import { resolveFrictions } from "./modules/frictions";
import { resolveIntent } from "./modules/intent";
import { lensKeyFor, resolveLens } from "./modules/lens";
import { resolveOpportunities } from "./modules/opportunities";
import { resolveStrengths } from "./modules/strengths";
import { resolveTradeOffs } from "./modules/tradeOffs";

/**
 * Object identity for interpretation — facts live on the Object Package.
 */
export type InterpretationObjectRef = {
  readonly id: string;
};

/**
 * Canonical InterpretationEngine input: Object + DecisionContext.
 */
export type InterpretInput = {
  readonly object: InterpretationObjectRef;
  readonly context: DecisionContext;
};

/**
 * Canonical Core producer of Interpretation (ADR-012).
 * Orchestrates semantic modules — no Experience, UI, localization, or renderers.
 */
export type InterpretationEngine = {
  readonly interpret: (input: InterpretInput) => Interpretation;
};

/**
 * Creates an InterpretationEngine that coordinates focused semantic modules.
 */
export function createInterpretationEngine(): InterpretationEngine {
  return Object.freeze({
    interpret(input: InterpretInput): Interpretation {
      const priorityIds = input.context.priorities.selected;
      const lens = resolveLens(priorityIds);
      const confidence = resolveConfidence(lens);

      return assembleInterpretation({
        objectId: input.object.id,
        priorityIds,
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

/**
 * Compatibility shape for existing callers — adapted to DecisionContext.
 */
export type InterpretObjectInput = {
  readonly objectId: string;
  readonly priorityIds: readonly string[];
};

/**
 * Adapts legacy { objectId, priorityIds } into canonical InterpretInput.
 */
export function toInterpretInput(input: InterpretObjectInput): InterpretInput {
  return Object.freeze({
    object: Object.freeze({ id: input.objectId }),
    context: createDecisionContext({
      priorities: { selected: input.priorityIds },
    }),
  });
}
