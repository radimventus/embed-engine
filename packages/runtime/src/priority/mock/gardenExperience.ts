/**
 * Mock Experience for Garden — presentation contract from priority-garden.md §6.
 * Static copy only; not produced by a real Experience Composer.
 */

import type { Experience } from "@embed-engine/core/priority";

export const gardenExperience: Experience = {
  id: "mock-experience-garden-house-modern-01",
  title: "Čtení domu přes zahradu",
  summary:
    "Podle vaší priority Zahrada se tento dům čte jako objekt, kde venkovní prostor není jen „něco navíc“, ale součást každodenního bydlení — pokud sedí propojení denní zóny s venkem a charakter pozemku.",
  focus: [
    "vztah domu k venkovnímu prostoru",
    "propojení denní zóny ven",
    "soukromí na pozemku",
  ],
  evidence: [
    {
      id: "ev-outdoor-relation",
      title: "Vztah k venkovnímu prostoru",
      description:
        "Dům nabízí vztah k venkovnímu prostoru, který lze číst jako součást denního života.",
    },
    {
      id: "ev-day-zone",
      title: "Denní zóna a východ ven",
      description:
        "Denní zóna má potenciál otevřít se ven — posezení a pohyb venku pak dávají smysl.",
    },
    {
      id: "ev-privacy-lot",
      title: "Soukromí mimo ulici",
      description:
        "Zahrada / pozemek dává prostor soukromí mimo ulici — pokud to dispozice a okolí podporují.",
    },
  ],
  concerns: [
    {
      id: "co-garden-not-equal",
      title: "Ne každá zahrada znamená stejný život venku",
      description:
        "Záleží na velikosti, soukromí a dostupnosti z domu.",
      severity: "medium",
    },
    {
      id: "co-verify-access",
      title: "Ověřit východ a výškové rozdíly",
      description:
        "Pokud je klíčové přímé propojení obývacího prostoru ven, ověřte konkrétní východ a výškové rozdíly.",
      severity: "medium",
    },
    {
      id: "co-layout-not-solved",
      title: "Zahrada neřeší dispozici uvnitř",
      description:
        "Zahrada jen mění, co je při prohlídce důležité — neřeší sama o sobě vnitřní uspořádání.",
      severity: "low",
    },
  ],
  confidence: {
    level: "medium",
    score: 62,
    explanation:
      "Střední — opírá se o vybranou prioritu a základní fakta domu; ještě neznáme vaši přesnou představu o velikosti a způsobu užívání zahrady.",
  },
  recommendations: [
    "Prohlédněte místa, kde dům potkává zahradu — denní zónu a východ ven.",
  ],
  actions: [
    {
      id: "act-map-threshold",
      label: "Podívat se na místa dům ↔ zahrada",
      type: "primary",
      intent: "explore",
    },
    {
      id: "act-review-reading",
      label: "Vrátit se k interpretační kartě",
      type: "secondary",
      intent: "explore",
    },
  ],
};
