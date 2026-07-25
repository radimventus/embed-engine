/**
 * PT-013 — Rejected / accepted heating technology.
 */

import type {
  RecommendationRule,
  RecommendationRuleContribution,
  RecommendationRuleInput,
} from "./RecommendationRule";
import { asString, findMemoryValue } from "./ruleHelpers";

const HEAT_PUMP = "heat-pump";

export const heatingPreferenceRule: RecommendationRule = {
  id: "heating-preference",
  apply(input: RecommendationRuleInput): RecommendationRuleContribution {
    const rejected = asString(
      findMemoryValue(input.memory, "rejectedOptions", "heating"),
    );
    const accepted = asString(
      findMemoryValue(input.memory, "acceptedOptions", "heating"),
    );

    if (accepted === HEAT_PUMP) {
      return {
        recommendedOptions: [
          {
            id: "heating:heat-pump",
            label: "Tepelné čerpadlo",
          },
        ],
        matchedPreferences: ["heating:heat-pump:accepted"],
        reasoning: [
          "Uživatel akceptoval tepelné čerpadlo — lze jej zahrnout do doporučení.",
        ],
      };
    }

    if (rejected === HEAT_PUMP) {
      return {
        avoidedOptions: [
          {
            id: "heating:heat-pump",
            label: "Tepelné čerpadlo",
          },
        ],
        matchedPreferences: ["heating:heat-pump:rejected"],
        reasoning: [
          "Uživatel odmítl tepelné čerpadlo — neargumentovat jeho výhodami.",
        ],
      };
    }

    return {};
  },
};
