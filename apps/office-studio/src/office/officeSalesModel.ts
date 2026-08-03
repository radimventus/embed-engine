/**
 * OF-03 — Office Sales Workspace data model (MVP).
 * Partner is the entry entity; commercial case holds Offer → Order → Waiting Payment.
 * Out of scope: Document Center, PDF, click-wrap, proforma, email, PaymentReceived, Builder Handoff.
 */

export type OfficePackageId = 'pilot-1' | 'starter-3' | 'studio-partner';

export type OfficeOfferStatus = 'draft' | 'ready' | 'sent';

export type OfficeOrderStatus =
  | 'none'
  | 'confirmed'
  | 'waiting_payment';

/** Commercial pipeline stages visible in Sales Workspace (Click Model MVP). */
export type OfficePipelineStage =
  | 'prepare_offer'
  | 'package_selected'
  | 'offer_sent'
  | 'order_confirmed'
  | 'waiting_payment';

export type OfficeSalesPackage = {
  readonly id: OfficePackageId;
  readonly name: string;
  readonly housesLabel: string;
  readonly priceCzk: number;
  readonly summary: string;
};

export type OfficePersonalizedOffer = {
  readonly id: string;
  readonly partnerId: string;
  readonly packageId: OfficePackageId | null;
  readonly title: string;
  readonly personalNote: string;
  readonly status: OfficeOfferStatus;
  readonly updatedAt: string;
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

export const OFFICE_SALES_PACKAGES: readonly OfficeSalesPackage[] =
  Object.freeze([
    {
      id: 'pilot-1',
      name: 'Pilot — 1 dům',
      housesLabel: '1 dům',
      priceCzk: 49_000,
      summary: 'Zakládající pilot s jedním Embed domem.',
    },
    {
      id: 'starter-3',
      name: 'Starter — 3 domy',
      housesLabel: '3 domy',
      priceCzk: 129_000,
      summary: 'Rozšířený start pro partnerskou prezentaci.',
    },
    {
      id: 'studio-partner',
      name: 'Studio Partner',
      housesLabel: 'Neomezeně (MVP)',
      priceCzk: 249_000,
      summary: 'Provozní partnerství se Studio přístupem.',
    },
  ]);

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

export function getSalesPackage(
  packageId: OfficePackageId,
): OfficeSalesPackage {
  return (
    OFFICE_SALES_PACKAGES.find((entry) => entry.id === packageId) ??
    OFFICE_SALES_PACKAGES[0]!
  );
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
