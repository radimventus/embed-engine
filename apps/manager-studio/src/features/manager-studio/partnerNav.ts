/**
 * PR-026 — Partner-facing Manager navigation (firma majitel).
 * Internal CONIS admin surfaces are filtered out of the partner UI.
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
    title: 'Přehled',
    ariaLabel: 'Přehled',
    items: [
      {
        id: 'mwc-dropoff',
        label: 'Místa ztráty zákazníků',
        short: 'Z',
      },
      {
        id: 'mwc-factors',
        label: 'Co ovlivňuje rozhodnutí zákazníků',
        short: 'R',
      },
      {
        id: 'mwc-improvements',
        label: 'Doporučená vylepšení Experience Layer',
        short: 'V',
      },
    ],
  },
  {
    title: 'Provoz',
    ariaLabel: 'Provoz',
    items: [
      { id: 'live-overview', label: 'Živý přehled', short: 'Ž' },
      { id: 'poc-metrics', label: 'Metriky platformy', short: 'M' },
    ],
  },
  {
    title: 'Shrnutí',
    ariaLabel: 'Shrnutí',
    items: [
      { id: 'pl-executive', label: 'Manažerské shrnutí', short: 'S' },
      { id: 'pl-insights', label: 'Produktové poznatky', short: 'P' },
    ],
  },
] as const;

export const PARTNER_SECTION_IDS: readonly string[] = [
  'manager-work-center',
  ...PARTNER_NAV_GROUPS.flatMap((group) => group.items.map((item) => item.id)),
];

export function partnerSectionLabel(sectionId: string | null): string {
  if (sectionId === null) return 'Přehled';
  if (sectionId === 'manager-work-center') {
    return 'Místa ztráty zákazníků';
  }
  for (const group of PARTNER_NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === sectionId);
    if (item !== undefined) return item.label;
  }
  return 'Přehled';
}
