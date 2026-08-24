/**
 * TASK 71B — Partner-facing Manager Intelligence navigation.
 *
 * The information architecture follows the actual Manager product:
 *
 * Overview → decision intelligence → Experience recommendations.
 *
 * Every navigation item maps to a real section rendered by
 * ManagerWorkCenterHome. Legacy pilot/platform navigation is intentionally
 * removed from the partner Manager surface.
 */

export type PartnerNavItem = {
  readonly id: string;
  readonly label: string;
  readonly short: string;
};

export type PartnerNavGroup = {
  readonly title: string;
  readonly ariaLabel: string;
  readonly items: readonly PartnerNavItem[];
};

export const PARTNER_NAV_GROUPS: readonly PartnerNavGroup[] = [
  {
    title: "Přehled",
    ariaLabel: "Manažerský přehled",
    items: [
      {
        id: "manager-work-center",
        label: "Přehled",
        short: "D",
      },
      {
        id: "manager-readiness",
        label: "Připravenost klientů",
        short: "P",
      },
      {
        id: "manager-trajectory",
        label: "Rozhodovací trajektorie",
        short: "T",
      },
    ],
  },
  {
    title: "Rozhodování",
    ariaLabel: "Rozhodování klientů",
    items: [
      {
        id: "manager-interests",
        label: "Zájmy klientů",
        short: "Z",
      },
      {
        id: "manager-engagement",
        label: "Aktivita v prohlídce",
        short: "E",
      },
    ],
  },
  {
    title: "Doporučení",
    ariaLabel: "Manažerský přehled",
    items: [
      {
        id: "manager-improvements",
        label: "Doporučená vylepšení",
        short: "V",
      },
    ],
  },
] as const;

export const PARTNER_SECTION_IDS: readonly string[] =
  PARTNER_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id));

export function partnerSectionLabel(sectionId: string | null): string {
  if (sectionId === null) return "Přehled";

  for (const group of PARTNER_NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === sectionId);

    if (item !== undefined) return item.label;
  }

  return "Přehled";
}
