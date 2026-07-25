/**
 * PT-013 — DecisionRecommendationEngine.
 *
 * Deterministic Conis business knowledge → RecommendationContext.
 * Never calls LLM. Never mutates Runtime or Memory.
 */

import type { DecisionContext } from "@embed-engine/runtime";

import type { ObjectContext } from "../models/PromptContext";
import type { ResolvedMemory } from "../memory/models/ResolvedMemory";
import {
  emptyRecommendationContext,
  type RecommendationContext,
  type RecommendationItem,
} from "./models/RecommendationContext";
import { budgetConflictRule } from "./rules/budgetConflictRule";
import { energyPriorityRule } from "./rules/energyPriorityRule";
import { familySizeRule } from "./rules/familySizeRule";
import { heatingPreferenceRule } from "./rules/heatingPreferenceRule";
import type {
  RecommendationRule,
  RecommendationRuleInput,
} from "./rules/RecommendationRule";

export type DecisionRecommendationInput = {
  readonly memory: ResolvedMemory;
  readonly object: ObjectContext;
  readonly decision: DecisionContext;
};

export type DecisionRecommendationEngineOptions = {
  readonly rules?: readonly RecommendationRule[];
};

export const DEFAULT_RECOMMENDATION_RULES: readonly RecommendationRule[] =
  Object.freeze([
    budgetConflictRule,
    heatingPreferenceRule,
    energyPriorityRule,
    familySizeRule,
  ]);

export class DecisionRecommendationEngine {
  private readonly rules: readonly RecommendationRule[];

  constructor(options: DecisionRecommendationEngineOptions = {}) {
    this.rules = options.rules ?? DEFAULT_RECOMMENDATION_RULES;
  }

  recommend(input: DecisionRecommendationInput): RecommendationContext {
    const ruleInput: RecommendationRuleInput = {
      memory: input.memory,
      object: input.object,
      decision: input.decision,
    };

    const recommended: RecommendationItem[] = [];
    const avoided: RecommendationItem[] = [];
    const reasoning: string[] = [];
    const matchedPreferences: string[] = [];
    const violatedConstraints: string[] = [];

    const recommendedIds = new Set<string>();
    const avoidedIds = new Set<string>();

    for (const rule of this.rules) {
      const contribution = rule.apply(ruleInput);

      for (const item of contribution.recommendedOptions ?? []) {
        if (!recommendedIds.has(item.id) && !avoidedIds.has(item.id)) {
          recommendedIds.add(item.id);
          recommended.push(item);
        }
      }

      for (const item of contribution.avoidedOptions ?? []) {
        if (!avoidedIds.has(item.id)) {
          avoidedIds.add(item.id);
          avoided.push(item);
          // Avoided wins over recommended for the same id.
          const idx = recommended.findIndex((r) => r.id === item.id);
          if (idx >= 0) {
            recommended.splice(idx, 1);
            recommendedIds.delete(item.id);
          }
        }
      }

      for (const line of contribution.reasoning ?? []) {
        if (!reasoning.includes(line)) {
          reasoning.push(line);
        }
      }
      for (const line of contribution.matchedPreferences ?? []) {
        if (!matchedPreferences.includes(line)) {
          matchedPreferences.push(line);
        }
      }
      for (const line of contribution.violatedConstraints ?? []) {
        if (!violatedConstraints.includes(line)) {
          violatedConstraints.push(line);
        }
      }
    }

    return Object.freeze({
      recommendedOptions: Object.freeze([...recommended]),
      avoidedOptions: Object.freeze([...avoided]),
      reasoning: Object.freeze([...reasoning]),
      matchedPreferences: Object.freeze([...matchedPreferences]),
      violatedConstraints: Object.freeze([...violatedConstraints]),
    });
  }
}

export function createDecisionRecommendationEngine(
  options?: DecisionRecommendationEngineOptions,
): DecisionRecommendationEngine {
  return new DecisionRecommendationEngine(options);
}

export function recommendDecision(
  input: DecisionRecommendationInput,
): RecommendationContext {
  return createDecisionRecommendationEngine().recommend(input);
}

export { emptyRecommendationContext };
