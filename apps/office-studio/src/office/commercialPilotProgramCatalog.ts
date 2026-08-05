/**
 * PT-CJ-02 — Pilot Program catalog (digital PDF nabídka).
 * Names · prices · order · recommended · Max as price anchor.
 * No new commercial presentation — mirrors approved PDF / Offer Experience facts.
 */

export type CommercialPilotProgramId = 'pilot' | 'pilot-plus' | 'pilot-max';

export type CommercialPilotProgramPackage = {
  readonly id: CommercialPilotProgramId;
  readonly name: string;
  readonly housesLabel: string;
  readonly priceCzk: number;
  readonly trialDays: number;
  readonly summary: string;
  readonly recommended: boolean;
  /** Price-anchor tier (Pilot Max) — visual hierarchy only. */
  readonly priceAnchor: boolean;
  readonly highlights: readonly string[];
};

export const COMMERCIAL_PILOT_TRIAL_DAYS = 90 as const;

/**
 * Commercial PDF order: Pilot → Pilot Plus (recommended) → Pilot Max (anchor).
 */
export const COMMERCIAL_PILOT_PROGRAM_PACKAGES: readonly CommercialPilotProgramPackage[] =
  Object.freeze([
    {
      id: 'pilot',
      name: 'Pilot',
      housesLabel: '1 dům',
      priceCzk: 4_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Vstupní spolupráce — 1 dům a plná CONIS nabídka pro váš web.',
      recommended: false,
      priceAnchor: false,
      highlights: [
        '1 dům',
        'Pro zákazníky, správu i obchod',
        'Základní branding',
      ],
    },
    {
      id: 'pilot-plus',
      name: 'Pilot Plus',
      housesLabel: 'až 3 domy',
      priceCzk: 14_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Doporučený start — až 3 domy a rozšířený provoz.',
      recommended: true,
      priceAnchor: false,
      highlights: ['Až 3 domy', 'Pro zákazníky, správu i obchod', 'Plný brand'],
    },
    {
      id: 'pilot-max',
      name: 'Pilot Max',
      housesLabel: 'Neomezeně',
      priceCzk: 29_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Partnerský provoz — více objektů a dlouhodobá spolupráce.',
      recommended: false,
      priceAnchor: true,
      highlights: [
        'Neomezeně objektů',
        'Pro zákazníky, správu i obchod',
        'Vlastní brand',
      ],
    },
  ]);

export function formatCommercialPilotPriceCzk(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isCommercialPilotProgramId(
  value: string,
): value is CommercialPilotProgramId {
  return COMMERCIAL_PILOT_PROGRAM_PACKAGES.some((pkg) => pkg.id === value);
}

/**
 * Soft map from workspace packageName → PDF program id (preview highlight only).
 */
export function resolveCommercialPilotProgramId(
  packageName: string | null | undefined,
): CommercialPilotProgramId | null {
  if (packageName == null || packageName.trim() === '' || packageName === '—') {
    return null;
  }
  const normalized = packageName.trim().toLowerCase();
  if (
    normalized === 'pilot plus' ||
    normalized === 'pilot-plus' ||
    normalized === 'starter'
  ) {
    return 'pilot-plus';
  }
  if (
    normalized === 'pilot max' ||
    normalized === 'pilot-max' ||
    normalized === 'studio partner'
  ) {
    return 'pilot-max';
  }
  if (normalized === 'pilot') {
    return 'pilot';
  }
  return null;
}
