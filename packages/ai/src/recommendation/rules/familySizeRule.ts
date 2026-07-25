/**
 * PT-013 — Family / household size guidance.
 */

import type {
  RecommendationRule,
  RecommendationRuleContribution,
  RecommendationRuleInput,
} from "./RecommendationRule";
import { asNumber, findMemoryValue, readObjectNumber } from "./ruleHelpers";

export const familySizeRule: RecommendationRule = {
  id: "family-size",
  apply(input: RecommendationRuleInput): RecommendationRuleContribution {
    const familySize = asNumber(
      findMemoryValue(input.memory, "facts", "familySize"),
    );
    if (familySize === null || familySize < 3) {
      return {};
    }

    const rooms = readObjectNumber(input.object.attributes, "rooms");
    const usableArea = readObjectNumber(
      input.object.attributes,
      "usableArea",
    );

    const recommended = [
      {
        id: "layout:family",
        label: "Dispozice vhodná pro rodinu",
      },
    ];

    const reasoning = [
      `Domácnost má ${familySize} osob — preferovat rodinnou dispozici.`,
    ];

    if (rooms !== null && rooms < 4 && familySize >= 4) {
      reasoning.push(
        `Objekt má jen ${rooms} pokojů při velikosti domácnosti ${familySize}.`,
      );
    }

    if (usableArea !== null && usableArea < 100 && familySize >= 4) {
      reasoning.push(
        `Užitná plocha ${usableArea} m² může být pro ${familySize} osob těsná.`,
      );
    }

    return {
      recommendedOptions: recommended,
      matchedPreferences: [`familySize:${familySize}`],
      reasoning,
    };
  },
};
