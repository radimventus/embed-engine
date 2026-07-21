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
      label: "Velkorysý obývák podporuje každodenní setkávání.",
    },
    {
      id: "kitchen",
      tone: profile === "couple" ? "support" : "attention",
      label:
        profile === "couple"
          ? "Kuchyně stačí na každodenní provoz pro dva."
          : "Kuchyně zůstává skromná — stolování žije s obývákem.",
    },
  ];

  if (profile === "couple") {
    factors.push({
      id: "household",
      tone: "support",
      label: "Pro tuto domácnost není školní nápor na koupelnu.",
    });
  } else if (profile === "family" || profile === "family-wfh") {
    factors.push({
      id: "rooms",
      tone: "support",
      label: "Dětský pokoj sedí na noční zónu rodiny.",
    });
    factors.push({
      id: "bath",
      tone: "attention",
      label: "Jedna koupelna zaslouží pozornost o školních ránech.",
    });
  } else {
    factors.push({
      id: "zones",
      tone: "support",
      label: "Denní a noční zóna zůstávají jasně oddělené.",
    });
  }

  if (profile === "family-wfh") {
    factors.push({
      id: "study",
      tone: "attention",
      label: "Chybí samostatná pracovna — práce z domu si vypůjčí obývák nebo ložnici.",
    });
  }

  factors.push({
    id: "stairs",
    tone: "attention",
    label: options.stairsConsidered
      ? "Schody zaslouží zvážení pro dlouhodobý komfort."
      : "Každodenní schody mezi denním a nočním životem zůstávají součástí plánu.",
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
