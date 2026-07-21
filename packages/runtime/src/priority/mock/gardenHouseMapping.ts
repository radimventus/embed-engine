/**
 * Mock House Mapping + Follow-up for Garden (priority-garden.md §7–8).
 * Conceptual anchors only (DM-OQ-06 Needs ADR for canonical IDs).
 */

import type {
  FollowUpHandoff,
  HouseMappingSet,
  TransitionMessage,
} from "@embed-engine/core/priority";
import {
  GARDEN_OBJECT_ID,
  gardenContentPackage,
} from "./gardenContentPackage";

export const gardenTransitionMessage: TransitionMessage = {
  text: gardenContentPackage.stageMicrocopy.transition,
};

export const gardenHouseMapping: HouseMappingSet = {
  object: { objectId: GARDEN_OBJECT_ID },
  entries: [
    {
      claimRef: { claimId: "ev-day-zone" },
      objectAnchor: { kind: "zone", id: "day-zone-outdoor-exit" },
      why: "Ukazuje, jestli je venkovní život součástí dne, nebo oddělený „na konci domu“.",
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "element", id: "terrace-threshold" },
      why: "Posezení a prah mezi interiérem a zahradou — praktický střed zahradního bydlení.",
    },
    {
      claimRef: { claimId: "ev-privacy-lot" },
      objectAnchor: { kind: "zone", id: "garden-lot" },
      why: "Dává měřítko: je venku kam jít, hrát si, sedět, mít klid.",
    },
    {
      claimRef: { claimId: "co-garden-not-equal" },
      objectAnchor: { kind: "relation", id: "street-neighbor-privacy" },
      why: "Zahrada bez soukromí často nesplní motivaci „vlastní venku“.",
    },
    {
      claimRef: { claimId: "ev-outdoor-relation" },
      objectAnchor: { kind: "medium", id: "interior-green-view" },
      why: "Posiluje čtení, že zahrada patří k atmosféře bydlení, ne jen k pozemku.",
    },
  ],
};

/** Follow-up modules from Garden §8 (MVP-relevant handoffs). */
export const gardenFollowUps: readonly FollowUpHandoff[] = [
  {
    targetId: "tour-day-zone",
    label: "Prohlídka denní zóny",
  },
  {
    targetId: "media-exterior-garden",
    label: "Média exteriér / zahrada",
  },
  {
    targetId: "decision-terminal",
    label: "Decision Terminal / Experience shrnutí",
  },
];

/** Primary MVP handoff used when completing the mock Journey. */
export const GARDEN_PRIMARY_FOLLOWUP_TARGET_ID = "tour-day-zone" as const;
