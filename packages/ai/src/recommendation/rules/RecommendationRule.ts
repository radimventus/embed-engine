/**
 * PT-013 — RecommendationRule contract.
 *
 * Pure, deterministic business knowledge. Never calls LLM.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ObjectContext } from "../../models/PromptContext";
import type { ResolvedMemory } from "../../memory/models/ResolvedMemory";
import type {
  RecommendationItem,
} from "../models/RecommendationContext";

export type RecommendationRuleInput = {
  readonly memory: ResolvedMemory;
  readonly object: ObjectContext;
  readonly decision: DecisionContext;
};

export type RecommendationRuleContribution = {
  readonly recommendedOptions?: readonly RecommendationItem[];
  readonly avoidedOptions?: readonly RecommendationItem[];
  readonly reasoning?: readonly string[];
  readonly matchedPreferences?: readonly string[];
  readonly violatedConstraints?: readonly string[];
};

export interface RecommendationRule {
  readonly id: string;
  apply(input: RecommendationRuleInput): RecommendationRuleContribution;
}
