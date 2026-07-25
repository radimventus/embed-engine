/**
 * PT-003 — DecisionContextBuilder.
 *
 * Pure function over MVP Decision Story only.
 * Does not read UI. Does not score. Does not call AI.
 */

import type { PriorityPipelineDecisionStory } from "./PriorityDecisionSession";
import type { DecisionContext } from "./DecisionContext";

type PriorityContextMapping = {
  readonly headline: string;
  readonly summary: string;
  readonly recommendations: readonly string[];
};

/**
 * priorityId → interpretive Context (single mapping table).
 * Extending a priority = edit this table only — not Experience components.
 */
const PRIORITY_CONTEXT_MAPPING: Readonly<
  Record<string, PriorityContextMapping>
> = {
  energy: {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary:
      "Během celé Experience budeme zvýrazňovat informace související s energetickou efektivitou.",
    recommendations: [
      "Energetický standard",
      "Technologie vytápění",
      "Roční provozní náklady",
    ],
  },
  "operating-costs": {
    headline: "Nejvyšší prioritu mají provozní náklady.",
    summary:
      "Během celé Experience budeme zvýrazňovat dlouhodobé náklady bydlení a provozní dopady.",
    recommendations: [
      "Roční provozní náklady",
      "Energetický standard",
      "Údržba a servis",
    ],
  },
  layout: {
    headline: "Nejvyšší prioritu má dispozice.",
    summary:
      "Během celé Experience budeme zvýrazňovat uspořádání místností a každodenní tok prostoru.",
    recommendations: [
      "Dispozice místností",
      "Denní zóny",
      "Flexibilita dispozice",
    ],
  },
  privacy: {
    headline: "Nejvyšší prioritu má soukromí.",
    summary:
      "Během celé Experience budeme zvýrazňovat klidové zóny a ochranu před okolím.",
    recommendations: [
      "Klidové zóny",
      "Oddělení od okolí",
      "Vztah k pozemku",
    ],
  },
  design: {
    headline: "Nejvyšší prioritu má design.",
    summary:
      "Během celé Experience budeme zvýrazňovat formu, materiály a vizuální charakter objektu.",
    recommendations: [
      "Materiály a povrchy",
      "Architektonický výraz",
      "Detail a kvalita provedení",
    ],
  },
  quality: {
    headline: "Nejvyšší prioritu má kvalita.",
    summary:
      "Během celé Experience budeme zvýrazňovat provedení, detaily a dlouhodobou hodnotu řešení.",
    recommendations: [
      "Kvalita provedení",
      "Detaily a materiály",
      "Dlouhodobá hodnota",
    ],
  },
  plot: {
    headline: "Nejvyšší prioritu má pozemek.",
    summary:
      "Během celé Experience budeme zvýrazňovat vztah domu k pozemku, orientaci a okolí.",
    recommendations: [
      "Orientace na pozemku",
      "Vztah k okolí",
      "Využití pozemku",
    ],
  },
  investment: {
    headline: "Nejvyšší prioritu má investice.",
    summary:
      "Během celé Experience budeme zvýrazňovat kapitálový rámec a obchodní dopady rozhodnutí.",
    recommendations: [
      "Investiční rámec",
      "Návratnost",
      "Provozní náklady",
    ],
  },
  maintenance: {
    headline: "Nejvyšší prioritu má údržba.",
    summary:
      "Během celé Experience budeme zvýrazňovat dlouhodobou správu a servisovatelnost.",
    recommendations: [
      "Údržba a servis",
      "Technologické systémy",
      "Provozní zátěž",
    ],
  },
  flexibility: {
    headline: "Nejvyšší prioritu má flexibilita.",
    summary:
      "Během celé Experience budeme zvýrazňovat přizpůsobitelnost domu v čase.",
    recommendations: [
      "Flexibilita dispozice",
      "Změna použití",
      "Rozšiřitelnost",
    ],
  },
};

const EMPTY_CONTEXT_COPY: PriorityContextMapping = {
  headline: "Decision Context ještě neurčuje čočku Experience.",
  summary:
    "Vyberte priority — Decision Context se odvodí z Decision Story a řídí všechny moduly Experience.",
  recommendations: [],
};

/**
 * Build Decision Context from MVP Decision Story (PT-003).
 */
export function buildDecisionContext(
  story: PriorityPipelineDecisionStory,
): DecisionContext {
  const mapping =
    story.primaryPriority === null
      ? EMPTY_CONTEXT_COPY
      : (PRIORITY_CONTEXT_MAPPING[story.primaryPriority] ?? {
          headline: `Nejvyšší prioritu má ${story.primaryPriority}.`,
          summary:
            "Během celé Experience budeme zvýrazňovat informace související s vybranou prioritou.",
          recommendations: [story.primaryPriority],
        });

  return Object.freeze({
    headline: mapping.headline,
    summary: mapping.summary,
    focusPriority: story.primaryPriority,
    secondaryPriority: story.secondaryPriority,
    selectedPriorities: Object.freeze([...story.selectedPriorities]),
    recommendations: Object.freeze([...mapping.recommendations]),
  });
}
