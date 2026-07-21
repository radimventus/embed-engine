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
    label: "Pár",
    detail: "Dva dospělí · bez dětí · občasná práce z domu",
  },
  {
    id: "family",
    label: "Rodina",
    detail: "Rodiče + dítě · školní rána",
  },
  {
    id: "family-wfh",
    label: "Rodina + práce z domu",
    detail: "Rodina · intenzivní práce z domu",
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
          "Silná shoda pro pár: denní a noční zóna a velkorysý obývací pokoj sedí na klidné večery spolu. Proč vám to sedí: žádný školní nápor na koupelnu a práci z domu lze přesunout do obýváku. Počítejte s menší kuchyní a každodenními schody.",
      });
    case "family-wfh":
      return Object.freeze({
        status: "weak-fit" as const,
        summary:
          "Slabá shoda pro rodinu s intenzivní prací z domu: plán nemá samostatnou pracovnu. Proč to sedí na vaši domácnost: rodiče, dítě a práce se potkají v obýváku nebo ložnici — navíc jedna koupelna a každodenní schody. Pokračujte jen pokud tyto kompromisy přijmete, nebo dispozici odmítněte.",
      });
    case "family":
      return Object.freeze({
        status: "conditional-fit" as const,
        summary:
          "Podmíněná shoda pro typickou rodinu: denní a noční zóna podporuje společné večery i klidný spánek. Proč vám to sedí: dítě má vlastní pokoj a zóny zůstávají čisté. Podmínky: menší kuchyně, jedna koupelna o školních ránech, každodenní schody a žádná opravdová pracovna.",
      });
    default:
      return Object.freeze({
        status: "conditional-fit" as const,
        summary:
          "Podmíněná shoda: denní a noční zóna může fungovat. Přijměte menší kuchyni, jednu koupelnu, každodenní schody a absenci pracovny — nebo dispozici odmítněte. Až příště uveďte domácnost, bude verdikt přesnější.",
      });
  }
}

export function recommendPromptFor(
  profile: HouseholdProfile | undefined,
): string {
  switch (profile) {
    case "couple":
      return "Pro pár dispozice vychází silně: klid nahoře a velkorysý obývák dole. Potvrďte, pokud přijmete menší kuchyni a schody.";
    case "family-wfh":
      return "Pro rodinu s intenzivní prací z domu dispozice vychází slabě: bez pracovny se práce stěhuje do obýváku nebo ložnice. Potvrďte jen pokud kompromisy přijmete.";
    case "family":
      return "Pro rodinu s dítětem je dispozice podmíněná: zóny fungují, ale kuchyně, koupelna a schody jsou reálné podmínky. Potvrďte verdikt.";
    default:
      return "Potvrďte verdikt dispozice pro vaši domácnost — nebo dispozici odmítněte.";
  }
}
