/**
 * Mock Garden content package — static PriorityDefinition from priority-garden.md.
 *
 * Not a real content loader (DM-OQ-01 Needs ADR). Deterministic test/fixture data only.
 */

import type { PriorityDefinition } from "@embed-engine/core/priority";

export const GARDEN_PRIORITY_ID = "garden" as const;

export const GARDEN_OBJECT_ID = "house-modern-01" as const;

/**
 * Content Model / Garden §1–5 binding for priority `garden`.
 */
export const gardenContentPackage: PriorityDefinition = {
  priorityId: GARDEN_PRIORITY_ID,
  priorityLabel: "Zahrada",
  priorityMeaning:
    "Zahrada je priorita o životě venku a o vztahu domu k pozemku — ne o velikosti parcely jako realitním údaji.",
  priorityNot:
    "Verdikt „dům má / nemá ideální zahradu“; samostatný katalog pozemků; tlak na koupi kvůli „zahradnímu životnímu stylu“.",
  intent: {
    userIntentPhrases: [
      "Chceme zahradu.",
      "Děti potřebují ven.",
      "Chci posezení venku.",
      "Nechci byt bez venku.",
      "Záleží nám na soukromí na zahradě.",
      "Rádi vaříme / jíme venku.",
    ],
    intentSummary: "Pro nás je důležité, jak se s tímto domem žije venku.",
  },
  possibleMeanings: [
    "Rodina a pohyb — venkovní prostor pro děti, hry, domácí zvířata.",
    "Odpočinek — klidné posezení, ráno káva, večer venku.",
    "Soukromí — vlastní „venku“, ne sdílený dvůr bytového domu.",
    "Propojení s interiérem — obývací pokoj / kuchyň mají mít přímý smysl směrem ven.",
    "Sezónní život — jaro až podzim jako součást bydlení, ne jen víkendová výjimka.",
    "Pěstování — záhony, bylinky, malá užitková zahrada.",
    "Odlišení od bytu — zahrada jako důvod, proč volit dům.",
  ],
  stageMicrocopy: {
    selectionPrompt: "Co je pro vás při rozhodování o tomto domě podstatné?",
    confirmation: {
      title: "Zahrada je pro vás podstatná",
      body: "Podle vašeho výběru budeme dům číst hlavně podle toho, jak se bydlí venku a jak je dům s venkovním prostorem propojený.\n\nJeště nehodnotíme, jestli je dům „ideální“.\nNejdřív potvrďte, že toto je opravdu váš důraz.",
      primaryAction: "Potvrdit a pokračovat",
      secondaryAction: "Upravit priority",
    },
    transition:
      "Teď se podíváme na dům vaší optikou zahrady — co venkovní život v tomto objektu podporuje a na co si dát pozor.",
  },
};
