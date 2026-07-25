/**
 * PT-013 — Energy / operating-cost priority weighting.
 */

import type {
  RecommendationRule,
  RecommendationRuleContribution,
  RecommendationRuleInput,
} from "./RecommendationRule";
import { readObjectString } from "./ruleHelpers";

const ENERGY_PRIORITIES = new Set([
  "energy",
  "operating-costs",
  "provozni-naklady",
]);

export const energyPriorityRule: RecommendationRule = {
  id: "energy-priority",
  apply(input: RecommendationRuleInput): RecommendationRuleContribution {
    const focus = input.decision.focusPriority;
    const selected = input.decision.selectedPriorities;
    const isEnergyFocus =
      (focus !== null && ENERGY_PRIORITIES.has(focus)) ||
      selected.some((id) => ENERGY_PRIORITIES.has(id));

    if (!isEnergyFocus) {
      return {};
    }

    const energyClass = readObjectString(
      input.object.attributes,
      "energyClass",
    );

    const recommended = [
      {
        id: "energy:efficiency",
        label: "Energetická efektivita",
      },
      {
        id: "energy:operating-costs",
        label: "Nízké provozní náklady",
      },
    ];

    const reasoning = [
      "Priorita provozních nákladů / energie — zvýšit váhu energetické efektivity.",
    ];

    if (energyClass !== null) {
      reasoning.push(`Objekt má energetickou třídu ${energyClass}.`);
    }

    return {
      recommendedOptions: recommended,
      matchedPreferences: ["priority:energy"],
      reasoning,
    };
  },
};
