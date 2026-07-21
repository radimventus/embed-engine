import type {
  DecisionStoryComposeInput,
  DecisionStoryPack,
} from "@embed-engine/core/decision-layer";

import {
  isHouseholdProfile,
  recommendPromptFor,
  resolveDispositionOutcome,
  HOUSEHOLD_PROFILE_FACT_KEY,
  type HouseholdProfile,
} from "./household-outcome";

function payloadString(
  input: DecisionStoryComposeInput,
  key: string,
): string | undefined {
  const value = input.signalPayload[key];
  return typeof value === "string" ? value : undefined;
}

function readHouseholdProfile(
  input: DecisionStoryComposeInput,
): HouseholdProfile | undefined {
  const fromPayload = payloadString(input, "householdProfile");
  if (isHouseholdProfile(fromPayload)) {
    return fromPayload;
  }

  const fromFacts = input.facts?.[HOUSEHOLD_PROFILE_FACT_KEY];
  return isHouseholdProfile(fromFacts) ? fromFacts : undefined;
}

/** Client Studio walkthrough ids + object-house fixture ids. */
const DAY_ROOMS = new Set([
  "living-room",
  "kitchen",
  "terrace",
  "room-living",
  "room-kitchen",
]);
const NIGHT_ROOMS = new Set([
  "bedroom",
  "bathroom",
  "room-bedroom",
  "room-children",
  "room-bath",
]);
const UPPER_FLOORS = new Set(["1", "upper-floor", "first-floor", "floor-1"]);

/**
 * Disposition (Layout) Behavior Pack — Runtime Strategy data.
 * Knowledge source: docs/pilot/behavior-packs/disposition-layout-v1.md
 */
export const DISPOSITION_LAYOUT_PACK: DecisionStoryPack = {
  id: "disposition-layout-v1",
  storyId: "story.layout.disposition.v1",
  startQuestionIds: Object.freeze(["layout"]),
  spine: Object.freeze([
    "layout.confirm-focus",
    "layout.discover-day-zone",
    "layout.discover-night-zone",
    "layout.interpret-day-night-split",
    "layout.compare-living-kitchen",
    "layout.compare-indoor-garden",
    "layout.warn-bath-contention",
    "layout.ask-household-shape",
    "layout.recommend-disposition-fit",
  ]),
  moves: Object.freeze([
    {
      id: "layout.confirm-focus",
      intent: "confirm",
      purpose: "Nejdřív dispozice — pak krása.",
      advisorPrompt:
        "Než se necháme unést světlem v obýváku, rozhodněme, jestli plán sedí na váš týden. Dispozice první. Krása druhá.",
      tradeOff:
        "Pozornost na dispozici teď versus lítost z dispozice po emocionálním rozhodnutí.",
      ctaLabel: "Pokračovat",
    },
    {
      id: "layout.discover-day-zone",
      intent: "discover",
      purpose: "Poznejte denní zónu v přízemí.",
      advisorPrompt:
        "Stůjte v denní zóně. Obývák je velkorysý — 32 m². Kuchyně má 14 m². Všimněte si rozdílu teď, ne až po záclonách. Otevřete obývák nebo kuchyni — nebo pokračujte níže.",
      tradeOff: "Prostor pro setkávání versus pracovní plocha v kuchyni.",
      ctaLabel: "Otevřít obývací pokoj",
    },
    {
      id: "layout.discover-night-zone",
      intent: "discover",
      purpose: "Poznejte noční zónu jako odpočinek a soukromí.",
      advisorPrompt:
        "Noční pokoje jsou pro konec dne. Rodiče, dítě, jedna koupelna. Zeptejte se: kdo se ráno v 7:15 pere o koupelnu? Otevřete ložnici nebo koupelnu — nebo pokračujte níže.",
      tradeOff: "Akustické soukromí versus vertikální bydlení a sdílené jádro.",
      ctaLabel: "Otevřít ložnici",
    },
    {
      id: "layout.interpret-day-night-split",
      intent: "interpret",
      purpose: "Denní a noční zóna jako smlouva o životě.",
      advisorPrompt:
        "Tento dům odděluje společné od samotného. Den dole. Spánek nahoře. Síla, pokud jsou večery společenské a noci klidné — daň, pokud nesnášíte schody.",
      tradeOff: "Jasné zóny versus každodenní schody.",
      ctaLabel: "Pokračovat",
    },
    {
      id: "layout.compare-living-kitchen",
      intent: "compare",
      purpose: "Otevřete kompromis kuchyně vs. stolování.",
      advisorPrompt:
        "Buďte upřímní: potřebuje vaření velké jeviště, nebo setkávání? Tento plán sází na setkávání. Kuchyně zůstává skromná. Potvrďte a pokračujte.",
      tradeOff: "Komfort hostění versus důstojný prostor na vaření.",
      ctaLabel: "Pokračovat",
    },
    {
      id: "layout.compare-indoor-garden",
      intent: "compare",
      purpose: "Zahrada jako pokračování dispozice.",
      advisorPrompt:
        "Denní zóna chce přetékat ven. Zahrada odmění ty, kdo vycházejí ven — limity kuchyně ani koupelny ale nesmaže. Potvrďte a pokračujte.",
      tradeOff: "Omezení uvnitř versus kompenzace venku.",
      ctaLabel: "Pokračovat",
    },
    {
      id: "layout.warn-bath-contention",
      intent: "interpret",
      purpose: "Jedna koupelna nahoře = ranní tření.",
      advisorPrompt:
        "Jedna koupelna nahoře pro celou domácnost. Pokud jsou rána už teď napjatá, tohle to zesílí. Potvrďte riziko a pokračujte.",
      tradeOff: "Kompaktní mokré jádro versus souběžná ranní poptávka.",
      ctaLabel: "Pokračovat",
    },
    {
      id: "layout.warn-stairs-mobility",
      intent: "interpret",
      purpose: "Schody mezi dnem a nocí jako vědomá volba.",
      advisorPrompt:
        "Každá noc končí nahoře. Každé ráno začíná sestupem. S dítětem je to běžné. S hostem o berlích je to vyjednávání. Rozhodněte se s otevřenýma očima.",
      tradeOff: "Jasné zóny versus trvalá závislost na schodech.",
      ctaLabel: "Pokračovat",
      whyNow:
        "Protože jste právě prošli jiným patrem, stojí za to zvážit ještě jeden aspekt.",
    },
    {
      id: "layout.ask-household-shape",
      intent: "discover",
      purpose: "Než verdikt — kdo tu bude bydlet.",
      advisorPrompt:
        "Řekněte skutečnou domácnost — ne katalogovou rodinu. Vyberte nejbližší tvar, ať dispozici hodnotíme podle vašich rán, ne podle průměru.",
      tradeOff: "Aspirace versus kapacita plánu.",
      ctaLabel: "Pokračovat s touto domácností",
    },
    {
      id: "layout.recommend-disposition-fit",
      intent: "recommend",
      purpose: "Verdikt shody dispozice.",
      advisorPrompt: recommendPromptFor(undefined),
      tradeOff: "Pokračovat s podmínkami versus odmítnutí dispozice.",
      ctaLabel: "Potvrdit verdikt",
    },
  ]),
  isMoveComplete(moveId, input) {
    const questionId = payloadString(input, "questionId");
    const roomId =
      payloadString(input, "roomId") ?? input.focusRoomId;
    const floorId =
      payloadString(input, "floorId") ?? input.focusFloorId;
    const acknowledged =
      input.signalType === "QUESTION_OPENED" && questionId === moveId;

    switch (moveId) {
      case "layout.confirm-focus":
        return (
          input.signalType === "QUESTION_OPENED" &&
          (questionId === "layout" || questionId === moveId)
        );
      case "layout.discover-day-zone":
        return (
          acknowledged ||
          (input.signalType === "ROOM_VIEWED" &&
            roomId !== undefined &&
            DAY_ROOMS.has(roomId))
        );
      case "layout.discover-night-zone":
        return (
          acknowledged ||
          (input.signalType === "ROOM_VIEWED" &&
            roomId !== undefined &&
            NIGHT_ROOMS.has(roomId)) ||
          (input.signalType === "FLOOR_CHANGED" &&
            floorId !== undefined &&
            UPPER_FLOORS.has(floorId))
        );
      case "layout.ask-household-shape":
        return (
          acknowledged &&
          isHouseholdProfile(payloadString(input, "householdProfile"))
        );
      case "layout.interpret-day-night-split":
      case "layout.compare-living-kitchen":
      case "layout.compare-indoor-garden":
      case "layout.warn-bath-contention":
      case "layout.warn-stairs-mobility":
      case "layout.recommend-disposition-fit":
        return acknowledged;
      default:
        return false;
    }
  },
  resolveOutcome(input) {
    return resolveDispositionOutcome(readHouseholdProfile(input));
  },
};
