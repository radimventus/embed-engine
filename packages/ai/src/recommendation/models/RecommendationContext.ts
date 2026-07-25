/**
 * PT-013 — RecommendationContext: deterministic decision guidance for prompts.
 *
 * LLM explains and communicates; it does not invent recommendations.
 */

export type RecommendationItem = {
  readonly id: string;
  readonly label: string;
};

export type RecommendationContext = {
  readonly recommendedOptions: readonly RecommendationItem[];
  readonly avoidedOptions: readonly RecommendationItem[];
  readonly reasoning: readonly string[];
  readonly matchedPreferences: readonly string[];
  readonly violatedConstraints: readonly string[];
};

export function emptyRecommendationContext(): RecommendationContext {
  return Object.freeze({
    recommendedOptions: Object.freeze([] as RecommendationItem[]),
    avoidedOptions: Object.freeze([] as RecommendationItem[]),
    reasoning: Object.freeze([] as string[]),
    matchedPreferences: Object.freeze([] as string[]),
    violatedConstraints: Object.freeze([] as string[]),
  });
}
