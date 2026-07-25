/**
 * PT-003 — Decision Context.
 *
 * DecisionStory = what Runtime decided.
 * DecisionContext = how Experience modules present that decision.
 *
 * Deterministic. No AI. No LLM.
 */

export type DecisionContext = {
  readonly headline: string;
  readonly summary: string;
  readonly focusPriority: string | null;
  readonly secondaryPriority: string | null;
  readonly selectedPriorities: readonly string[];
  readonly recommendations: readonly string[];
};
