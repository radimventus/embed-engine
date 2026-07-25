/**
 * PT-013 — Decision Recommendation public surface.
 */

export type {
  RecommendationContext,
  RecommendationItem,
} from "./models/RecommendationContext";
export { emptyRecommendationContext } from "./models/RecommendationContext";

export type {
  RecommendationRule,
  RecommendationRuleInput,
  RecommendationRuleContribution,
} from "./rules/RecommendationRule";

export {
  DecisionRecommendationEngine,
  createDecisionRecommendationEngine,
  recommendDecision,
  DEFAULT_RECOMMENDATION_RULES,
  type DecisionRecommendationInput,
  type DecisionRecommendationEngineOptions,
} from "./DecisionRecommendationEngine";

export { budgetConflictRule } from "./rules/budgetConflictRule";
export { heatingPreferenceRule } from "./rules/heatingPreferenceRule";
export { energyPriorityRule } from "./rules/energyPriorityRule";
export { familySizeRule } from "./rules/familySizeRule";
