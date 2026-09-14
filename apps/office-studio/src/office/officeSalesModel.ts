/**
 * OF-03 / PE-09 — Pilot Offer & Checkout data model (Office MVP).
 * Packages: Pilot · Starter · Studio Partner. No payment gateway / invoicing.
 */

export type OfficePackageId = 'pilot' | 'starter' | 'studio-partner';

export type OfficeOfferStatus = 'draft' | 'ready' | 'sent' | 'accepted';

export type OfficeOrderStatus =
  | 'none'
  | 'confirmed'
  | 'waiting_payment';

/** Commercial pipeline stages visible in Sales Workspace. */
export type OfficePipelineStage =
  | 'prepare_offer'
  | 'package_selected'
  | 'offer_sent'
  | 'order_confirmed'
  | 'waiting_payment';

export type OfficePackageFeatureId =
  | 'houses'
  | 'trial'
  | 'client_studio'
  | 'manager_studio'
  | 'sales_studio'
  | 'branding'
  | 'support';

export type OfficeSalesPackage = {
  readonly id: OfficePackageId;
  readonly name: string;
  readonly houses: number | null;
  readonly housesLabel: string;
  readonly priceCzk: number;
  readonly trialDays: number;
  readonly summary: string;
  readonly recommended: boolean;
  readonly features: Readonly<Record<OfficePackageFeatureId, string>>;
};

export type OfficePersonalizedOffer = {
  readonly id: string;
  readonly partnerId: string;
  readonly packageId: OfficePackageId | null;
  readonly title: string;
  readonly personalNote: string;
  readonly status: OfficeOfferStatus;
  readonly updatedAt: string;
  readonly priceCzk: number | null;
  readonly licenseHouses: number | null;
  readonly trialDays: number | null;
  readonly validUntil: string | null;
  readonly viewedAt: string | null;
  readonly acceptedAt: string | null;
};

export type OfficeOrderSummary = {
  readonly id: string;
  readonly partnerId: string;
  readonly offerId: string;
  readonly packageId: OfficePackageId;
  readonly amountCzk: number;
  readonly status: Exclude<OfficeOrderStatus, 'none'>;
  readonly confirmedAt: string;
};

export type OfficeSalesCase = {
  readonly partnerId: string;
  readonly stage: OfficePipelineStage;
  readonly offer: OfficePersonalizedOffer;
  readonly order: OfficeOrderSummary | null;
};

export type PackageComparisonRow = {
  readonly featureId: OfficePackageFeatureId;
  readonly label: string;
  readonly values: Readonly<Record<OfficePackageId, string>>;
};

/** Default commercial validity of a pilot offer (days). */
export const PILOT_OFFER_VALIDITY_DAYS = 14;

export const OFFICE_SALES_PACKAGES: readonly OfficeSalesPackage[] =
  Object.freeze([
    {
      id: 'pilot',
      name: 'PILOT',
      houses: 1,
      housesLabel: '1 dům',
      priceCzk: 9_970,
      trialDays: 30,
      summary: 'Nejjednodušší způsob, jak CONIS ověřit v praxi.',
      recommended: false,
      features: {
        houses: '1 dům',
        trial: '30 dní',
        client_studio: 'Ano',
        manager_studio: 'Ano',
        sales_studio: 'Ano',
        branding: 'Základní',
        support: 'E-mail',
      },
    },
    {
      id: 'starter',
      name: 'PILOT TIP',
      houses: 3,
      housesLabel: '3 domy',
      priceCzk: 19_970,
      trialDays: 30,
      summary: 'Pro rychlé ověření na reprezentativním vzorku nabídky.',
      recommended: true,
      features: {
        houses: '3 domy',
        trial: '30 dní',
        client_studio: 'Ano',
        manager_studio: 'Ano',
        sales_studio: 'Ano',
        branding: 'Plný brand',
        support: 'Prioritní',
      },
    },
    {
      id: 'studio-partner',
      name: 'PILOT MAX',
      houses: 10,
      housesLabel: 'až 10 domů',
      priceCzk: 59_970,
      trialDays: 30,
      summary: 'Pro rychlejší nasazení větší části katalogu.',
      recommended: false,
      features: {
        houses: 'až 10 domů',
        trial: '30 dní',
        client_studio: 'Ano',
        manager_studio: 'Ano',
        sales_studio: 'Ano',
        branding: 'Plný brand + hero',
        support: 'Dedicated',
      },
    },
  ]);

export const PACKAGE_COMPARISON_FEATURES: readonly {
  readonly id: OfficePackageFeatureId;
  readonly label: string;
}[] = Object.freeze([
  { id: 'houses', label: 'Počet domů' },
  { id: 'trial', label: 'Zkušební období' },
  { id: 'client_studio', label: 'Client Studio' },
  { id: 'manager_studio', label: 'Manager Studio' },
  { id: 'sales_studio', label: 'Sales Studio' },
  { id: 'branding', label: 'Branding' },
  { id: 'support', label: 'Podpora' },
]);

export function buildPackageComparison(): readonly PackageComparisonRow[] {
  return PACKAGE_COMPARISON_FEATURES.map((feature) => {
    const values = {
      pilot: getSalesPackage('pilot').features[feature.id],
      starter: getSalesPackage('starter').features[feature.id],
      'studio-partner': getSalesPackage('studio-partner').features[feature.id],
    } as const;
    return {
      featureId: feature.id,
      label: feature.label,
      values,
    };
  });
}

export const OFFICE_PIPELINE_STAGE_LABELS: Record<
  OfficePipelineStage,
  string
> = {
  prepare_offer: 'Příprava nabídky',
  package_selected: 'Balíček vybrán',
  offer_sent: 'Nabídka odeslána',
  order_confirmed: 'Objednávka',
  waiting_payment: 'Čeká na platbu',
};

export const OFFICE_PIPELINE_STAGE_ORDER: readonly OfficePipelineStage[] =
  Object.freeze([
    'prepare_offer',
    'package_selected',
    'offer_sent',
    'order_confirmed',
    'waiting_payment',
  ]);

export const OFFICE_ORDER_STATUS_LABELS: Record<
  Exclude<OfficeOrderStatus, 'none'>,
  string
> = {
  confirmed: 'Potvrzena',
  waiting_payment: 'Čeká na platbu',
};

/** Map legacy package ids to PE-09 Pilot / Starter / Studio Partner. */
export function normalizePackageId(
  packageId: string | null | undefined,
): OfficePackageId {
  switch (packageId) {
    case 'starter':
    case 'starter-3':
    case 'pilot-plus':
      return 'starter';
    case 'studio-partner':
    case 'pilot-max':
      return 'studio-partner';
    case 'pilot':
    case 'pilot-1':
    default:
      return 'pilot';
  }
}

export function getSalesPackage(
  packageId: OfficePackageId | string,
): OfficeSalesPackage {
  const id = normalizePackageId(packageId);
  return (
    OFFICE_SALES_PACKAGES.find((entry) => entry.id === id) ??
    OFFICE_SALES_PACKAGES[0]!
  );
}

export function computeOfferValidUntil(
  fromIso: string,
  days = PILOT_OFFER_VALIDITY_DAYS,
): string {
  const from = Date.parse(fromIso);
  const base = Number.isNaN(from) ? Date.now() : from;
  return new Date(base + days * 24 * 60 * 60 * 1000).toISOString();
}

export function formatCzk(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function pipelineStageTone(
  stage: OfficePipelineStage,
): 'draft' | 'info' | 'warning' | 'gold' | 'pass' {
  switch (stage) {
    case 'prepare_offer':
      return 'draft';
    case 'package_selected':
      return 'info';
    case 'offer_sent':
      return 'info';
    case 'order_confirmed':
      return 'warning';
    case 'waiting_payment':
      return 'gold';
  }
}
