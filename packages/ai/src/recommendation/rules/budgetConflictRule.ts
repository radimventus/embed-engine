/**
 * PT-013 — Budget vs object price conflict.
 */

import type {
  RecommendationRule,
  RecommendationRuleContribution,
  RecommendationRuleInput,
} from "./RecommendationRule";
import {
  asNumber,
  findMemoryValue,
  readObjectNumber,
} from "./ruleHelpers";

export const budgetConflictRule: RecommendationRule = {
  id: "budget-conflict",
  apply(input: RecommendationRuleInput): RecommendationRuleContribution {
    const budget = asNumber(findMemoryValue(input.memory, "constraints", "budget"));
    const price = readObjectNumber(input.object.attributes, "price");

    if (budget === null || price === null) {
      return {};
    }

    if (budget < price) {
      return {
        violatedConstraints: [
          `budget:${budget}<price:${price}`,
        ],
        reasoning: [
          "Rozpočet uživatele je nižší než cena objektu — označeno jako konflikt.",
        ],
        avoidedOptions: [
          {
            id: "purchase-at-listed-price",
            label: "Koupě za uvedenou cenu bez úpravy",
          },
        ],
      };
    }

    return {
      matchedPreferences: [`budget-fits-price:${budget}>=${price}`],
      reasoning: [
        "Rozpočet uživatele pokrývá cenu objektu.",
      ],
    };
  },
};
