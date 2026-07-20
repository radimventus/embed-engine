import type { DecisionOutcome } from "@embed-engine/core/decision-layer";

/** Minimal household shapes for FP-01 Slice B — session only. */
export const HOUSEHOLD_PROFILES = [
  "couple",
  "family",
  "family-wfh",
] as const;

export type HouseholdProfile = (typeof HOUSEHOLD_PROFILES)[number];

export const HOUSEHOLD_PROFILE_FACT_KEY = "household.profile";

export function isHouseholdProfile(value: unknown): value is HouseholdProfile {
  return (
    typeof value === "string" &&
    (HOUSEHOLD_PROFILES as readonly string[]).includes(value)
  );
}

export type HouseholdChoice = {
  readonly id: HouseholdProfile;
  readonly label: string;
  readonly detail: string;
};

export const HOUSEHOLD_CHOICES: readonly HouseholdChoice[] = Object.freeze([
  {
    id: "couple",
    label: "Couple",
    detail: "Two adults · no children · light WFH",
  },
  {
    id: "family",
    label: "Family",
    detail: "Parents + child · school mornings",
  },
  {
    id: "family-wfh",
    label: "Family + WFH",
    detail: "Family · heavy work-from-home",
  },
]);

/**
 * Personalized disposition outcome for the captured household.
 * Rules mirror docs/pilot/dialogues/layout-dialogue-v1.md §5–6 — no scoring engine.
 */
export function resolveDispositionOutcome(
  profile: HouseholdProfile | undefined,
): DecisionOutcome {
  switch (profile) {
    case "couple":
      return Object.freeze({
        status: "strong-fit" as const,
        summary:
          "Strong fit for a couple: day/night split and a generous living room match quiet evenings together. Why it fits you: no school-morning bath rush, and WFH can borrow living without competing with children. Still accept a modest kitchen and daily stairs.",
      });
    case "family-wfh":
      return Object.freeze({
        status: "weak-fit" as const,
        summary:
          "Weak fit for a family with heavy WFH: the plan has no dedicated study. Why this matches your household: parents, child, and work will compete for living and bedroom space, on top of one bath and daily stairs. Pursue only if you accept serious compromises — or walk away on layout grounds.",
      });
    case "family":
      return Object.freeze({
        status: "conditional-fit" as const,
        summary:
          "Conditional fit for a typical family path: day/night split supports social evenings and quiet nights. Why it fits you: a child gets their own room and zones stay clear. Conditions: modest kitchen, one bath on school mornings, daily stairs, and no true study.",
      });
    default:
      return Object.freeze({
        status: "conditional-fit" as const,
        summary:
          "Conditional fit: day/night split can work. Accept modest kitchen, one bath, daily stairs, and no dedicated study — or reject on disposition grounds. Tell us your household next time for a sharper verdict.",
      });
  }
}

export function recommendPromptFor(
  profile: HouseholdProfile | undefined,
): string {
  switch (profile) {
    case "couple":
      return "For a couple, this layout leans strong: quiet nights upstairs and a generous living room downstairs. Confirm if you accept a modest kitchen and stairs.";
    case "family-wfh":
      return "For a family with heavy WFH, this layout leans weak: no study means work borrows living or bedroom. Confirm only if those compromises are acceptable.";
    case "family":
      return "For a family with a child, this layout is conditional: zones work, but kitchen, bath, and stairs are real conditions. Confirm the verdict.";
    default:
      return "Confirm the disposition verdict for your household — or walk away on layout grounds.";
  }
}
