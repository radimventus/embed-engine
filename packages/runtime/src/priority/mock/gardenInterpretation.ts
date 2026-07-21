/**
 * Mock Interpretation for Garden — machine meaning only (ADR-012).
 * Codes reflect Garden §6 themes; no UI wording.
 */

import type { Interpretation } from "@embed-engine/core/priority";
import { GARDEN_OBJECT_ID, GARDEN_PRIORITY_ID } from "./gardenContentPackage";

export const gardenInterpretation: Interpretation = {
  id: "mock-interpretation-garden-house-modern-01",
  objectId: GARDEN_OBJECT_ID,
  priorityIds: [GARDEN_PRIORITY_ID],
  strengths: [
    {
      id: "str-outdoor-daily",
      code: "OUTDOOR_DAILY_LIFE",
      weight: 0.82,
    },
    {
      id: "str-day-zone-open",
      code: "DAY_ZONE_OUTDOOR_POTENTIAL",
      weight: 0.78,
    },
    {
      id: "str-privacy-lot",
      code: "LOT_PRIVACY_POTENTIAL",
      weight: 0.7,
    },
  ],
  frictions: [
    {
      id: "fri-garden-variability",
      code: "GARDEN_QUALITY_VARIABLE",
      weight: 0.55,
    },
    {
      id: "fri-access-levels",
      code: "OUTDOOR_ACCESS_LEVEL_CHECK",
      weight: 0.5,
    },
  ],
  opportunities: [
    {
      id: "opp-verify-threshold",
      code: "VERIFY_DAY_ZONE_THRESHOLD",
      weight: 0.75,
    },
  ],
  tradeOffs: [
    {
      id: "to-garden-vs-layout",
      code: "GARDEN_VS_INTERNAL_LAYOUT",
      favors: "OUTDOOR_DAILY_LIFE",
      against: "INTERNAL_LAYOUT_INDEPENDENT",
    },
  ],
  confidenceInputs: [
    {
      id: "ci-priority",
      code: "PRIORITY_LENS_GARDEN",
      contribution: 0.4,
    },
    {
      id: "ci-object-basics",
      code: "OBJECT_BASIC_FACTS",
      contribution: 0.35,
    },
    {
      id: "ci-usage-unknown",
      code: "USAGE_PREFERENCE_UNKNOWN",
      contribution: -0.15,
    },
  ],
  matchScore: 62,
  recommendedIntent: "VERIFY_HOUSE_GARDEN_THRESHOLD",
};
