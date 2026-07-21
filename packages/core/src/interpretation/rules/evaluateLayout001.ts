import type { InterpretationFactor } from "../Interpretation";
import type { ResolvedLens } from "../modules/lens";
import { getSemanticRuleById } from "./semanticRuleCatalog";
import type { SemanticRuleId } from "./SemanticRuleContract";

/**
 * Result of evaluating one semantic rule.
 * Pattern for future rules — no registry, no engine.
 */
export type SemanticRuleEvaluation = {
  readonly ruleId: SemanticRuleId;
  readonly factor: InterpretationFactor;
};

const RULE_ID = "LAYOUT_001" as const;

/**
 * LAYOUT_001 — bedroom capacity strength under the layout lens.
 *
 * Evaluates decision facts (active lens) and produces one semantic contribution.
 * Identical output to the former inline strengths entry.
 */
export function evaluateLayout001(input: {
  readonly lens: ResolvedLens;
}): SemanticRuleEvaluation | null {
  if (input.lens !== "layout") {
    return null;
  }

  const contract = getSemanticRuleById(RULE_ID);
  if (contract === undefined) {
    return null;
  }

  return Object.freeze({
    ruleId: contract.id,
    factor: Object.freeze({
      id: "s.bedrooms",
      code: contract.meaning,
      weight: 0.9,
    }),
  });
}
