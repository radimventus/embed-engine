import type { HouseholdProfile } from "./household-outcome";
import { STAIRS_WARN_MOVE_ID } from "./splice-stairs-warn";

export type DecisionFactorTone = "support" | "attention";

export type DecisionFactor = {
  readonly id: string;
  readonly tone: DecisionFactorTone;
  readonly label: string;
};

/**
 * Decision Factors for Outcome Commitment (FP-01 Slice D).
 * Presentation of known disposition facts — not a scoring engine.
 */
export function getDecisionFactors(
  profile: HouseholdProfile | undefined,
  options: { readonly stairsConsidered: boolean },
): readonly DecisionFactor[] {
  const factors: DecisionFactor[] = [
    {
      id: "living",
      tone: "support",
      label: "Generous living supports everyday gathering.",
    },
    {
      id: "kitchen",
      tone: profile === "couple" ? "support" : "attention",
      label:
        profile === "couple"
          ? "Kitchen supports everyday living for two."
          : "Kitchen stays modest — dining lives with living.",
    },
  ];

  if (profile === "couple") {
    factors.push({
      id: "household",
      tone: "support",
      label: "No school-morning bath rush for this household.",
    });
  } else if (profile === "family" || profile === "family-wfh") {
    factors.push({
      id: "rooms",
      tone: "support",
      label: "Children's room matches a family night zone.",
    });
    factors.push({
      id: "bath",
      tone: "attention",
      label: "One bath deserves consideration on school mornings.",
    });
  } else {
    factors.push({
      id: "zones",
      tone: "support",
      label: "Day and night zones stay clearly separated.",
    });
  }

  if (profile === "family-wfh") {
    factors.push({
      id: "study",
      tone: "attention",
      label: "No dedicated study — WFH will borrow living or bedroom.",
    });
  }

  factors.push({
    id: "stairs",
    tone: "attention",
    label: options.stairsConsidered
      ? "Stairs deserve consideration for long-term comfort."
      : "Daily stairs between day and night life remain part of this plan.",
  });

  return Object.freeze(factors);
}

export function storyConsideredStairs(
  slots: readonly { readonly moveId: string; readonly status: string }[],
): boolean {
  return slots.some(
    (slot) =>
      slot.moveId === STAIRS_WARN_MOVE_ID &&
      (slot.status === "completed" || slot.status === "active"),
  );
}
