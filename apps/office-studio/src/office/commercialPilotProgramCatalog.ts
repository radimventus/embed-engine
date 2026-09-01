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
  /** Follow-on tariff after the pilot period (PDF commercial fact). */
  readonly followOnTariff: string;
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
      priceCzk: 9_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Nejjednodušší způsob, jak CONIS ověřit v praxi.',
      followOnTariff: 'Navazující tarif · Pilot',
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
      name: 'Pilot TIP',
      housesLabel: '3 domy',
      priceCzk: 19_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Pro rychlé ověření na reprezentativním vzorku nabídky.',
      followOnTariff: 'Navazující tarif · Pilot TIP',
      recommended: true,
      priceAnchor: false,
      highlights: ['3 domy', '90 dní provozu v ceně', 'Doporučená varianta'],
    },
    {
      id: 'pilot-max',
      name: 'Pilot Max',
      housesLabel: 'Až 10 domů',
      priceCzk: 59_970,
      trialDays: COMMERCIAL_PILOT_TRIAL_DAYS,
      summary: 'Pro rychlejší nasazení větší části katalogu.',
      followOnTariff: 'Navazující tarif · Pilot Max',
      recommended: false,
      priceAnchor: true,
      highlights: [
        'Až 10 domů',
        '90 dní provozu v ceně',
        'Rozšířený vzorek katalogu',
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
 * Shared Project `offerTemplateId` → commercial package display name.
 * Builder authors the template bind; Office does not invent package identity.
 */
export function packageNameFromOfferTemplate(
  offerTemplateId: string | null | undefined,
): string {
  switch (offerTemplateId) {
    case 'template-starter':
      return 'Starter';
    case 'template-pilot':
      return 'Pilot';
    case 'template-studio':
      return 'Studio Partner';
    default:
      return '—';
  }
}

/**
 * Soft map from workspace packageName / offerTemplateId → PDF program id.
 */
export function resolveCommercialPilotProgramId(
  packageName: string | null | undefined,
): CommercialPilotProgramId | null {
  if (packageName == null || packageName.trim() === '' || packageName === '—') {
    return null;
  }
  const normalized = packageName.trim().toLowerCase();
  if (
    normalized === 'pilot tip' ||
    normalized === 'pilot-tip' ||
    normalized === 'pilot plus' ||
    normalized === 'pilot-plus' ||
    normalized === 'starter' ||
    normalized === 'template-starter'
  ) {
    return 'pilot-plus';
  }
  if (
    normalized === 'pilot max' ||
    normalized === 'pilot-max' ||
    normalized === 'studio partner' ||
    normalized === 'template-studio'
  ) {
    return 'pilot-max';
  }
  if (normalized === 'pilot' || normalized === 'template-pilot') {
    return 'pilot';
  }
  return null;
}

/** Licence line from Shared Project offer template → catalog houses · trial. */
export function licenseLabelFromOfferTemplate(
  offerTemplateId: string | null | undefined,
): string {
  const packageName = packageNameFromOfferTemplate(offerTemplateId);
  const programId = resolveCommercialPilotProgramId(packageName);
  if (programId === null) return '—';
  const program = COMMERCIAL_PILOT_PROGRAM_PACKAGES.find(
    (item) => item.id === programId,
  );
  if (program === undefined) return '—';
  return `${program.housesLabel} · ${program.trialDays} dní`;
}
