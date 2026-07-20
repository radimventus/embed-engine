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
      purpose: "Align on disposition as the decision focus.",
      advisorPrompt:
        "Before we fall for the living room light — let’s decide whether this plan fits your week. Disposition first. Beauty second.",
      tradeOff:
        "Attention on layout now versus discovering layout regret after emotional commitment.",
    },
    {
      id: "layout.discover-day-zone",
      intent: "discover",
      purpose: "Build a mental model of the ground-floor day zone.",
      advisorPrompt:
        "Stand in the day zone. Living is generous — 32 m². Kitchen is 14 m². Notice that gap now, not after you buy curtains. Open living or kitchen — or continue below.",
      tradeOff: "Gathering scale versus cooking workspace.",
    },
    {
      id: "layout.discover-night-zone",
      intent: "discover",
      purpose: "Experience the night zone as rest and privacy.",
      advisorPrompt:
        "Night rooms are for ending the day. Parents, child, one bath. Ask yourself: who fights for the bathroom at 7:15? Open a bedroom or bathroom — or continue below.",
      tradeOff: "Acoustic privacy versus vertical living and a shared wet core.",
    },
    {
      id: "layout.interpret-day-night-split",
      intent: "interpret",
      purpose: "Explain day/night as a lifestyle contract.",
      advisorPrompt:
        "This house separates together from alone. Day downstairs. Sleep upstairs. Strength if evenings are social and nights need quiet — tax if you hate stairs.",
      tradeOff: "Zone clarity versus stair friction every day.",
    },
    {
      id: "layout.compare-living-kitchen",
      intent: "compare",
      purpose: "Force the dining placement trade-off into the open.",
      advisorPrompt:
        "Be honest: does cooking need a big stage, or does gathering? This plan bets on gathering. Kitchen stays modest. Acknowledge to continue.",
      tradeOff: "Hosting comfort versus cooking workspace dignity.",
    },
    {
      id: "layout.compare-indoor-garden",
      intent: "compare",
      purpose: "Treat garden as continuation of disposition.",
      advisorPrompt:
        "The day zone wants to spill outside. Garden rewards people who go out — it does not erase kitchen or bath limits. Acknowledge to continue.",
      tradeOff: "Indoor constraints versus outdoor compensation.",
    },
    {
      id: "layout.warn-bath-contention",
      intent: "interpret",
      purpose: "Name single upstairs bath as morning friction.",
      advisorPrompt:
        "One bath upstairs for the household. If mornings are already tense, this amplifies it. Acknowledge the risk to continue.",
      tradeOff: "Compact wet core versus parallel morning demand.",
    },
    {
      id: "layout.ask-household-shape",
      intent: "discover",
      purpose: "Load who will live here before a fit verdict.",
      advisorPrompt:
        "Tell the real household — not the brochure family. Pick the closest shape so disposition is judged against your mornings, not an average.",
      tradeOff: "Aspirational family story versus plan capacity.",
    },
    {
      id: "layout.recommend-disposition-fit",
      intent: "recommend",
      purpose: "Deliver a disposition fit conclusion.",
      advisorPrompt: recommendPromptFor(undefined),
      tradeOff: "Pursue with conditions versus layout-based rejection.",
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
