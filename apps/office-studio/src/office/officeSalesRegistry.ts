/**
 * OF-03 — Sales Workspace registry (in-memory MVP).
 * One commercial case per partner — Personalized Offer, Package, Order, Waiting Payment.
 */

import { appendOfficeEvent } from './officeEventCatalog';
import {
  defaultNextStep,
  type OfficePartnerStatus,
} from './officePartnerModel';
import {
  draftFromPartner,
  getPartner,
  listPartners,
  updatePartner,
} from './officePartnerRegistry';
import {
  formatCzk,
  getSalesPackage,
  type OfficeOfferStatus,
  type OfficeOrderSummary,
  type OfficePersonalizedOffer,
  type OfficePipelineStage,
  type OfficePackageId,
  type OfficeSalesCase,
} from './officeSalesModel';

function nowIso(): string {
  return new Date().toISOString();
}

function makeOffer(
  partnerId: string,
  partial: Partial<OfficePersonalizedOffer> & {
    readonly status: OfficeOfferStatus;
  },
): OfficePersonalizedOffer {
  const partner = getPartner(partnerId);
  const name = partner?.name ?? 'Partner';
  return {
    id: `offer-${partnerId}`,
    partnerId,
    packageId: partial.packageId ?? null,
    title: partial.title ?? `Personalizovaná nabídka · ${name}`,
    personalNote:
      partial.personalNote ??
      `Nabídka připravená pro ${name} — CONIS Embed pilot.`,
    status: partial.status,
    updatedAt: partial.updatedAt ?? nowIso(),
  };
}

const SEED_CASES: readonly OfficeSalesCase[] = Object.freeze([
  {
    partnerId: 'p-nord',
    stage: 'offer_sent',
    offer: makeOffer('p-nord', {
      packageId: 'pilot-1',
      status: 'sent',
      title: 'Personalizovaná nabídka · Nordhaus',
      personalNote:
        'Pilot 1 dům pro Nordhaus — Embed Experience na partnerském webu.',
      updatedAt: '2026-08-02T11:40:00.000Z',
    }),
    order: null,
  },
  {
    partnerId: 'p-linea',
    stage: 'waiting_payment',
    offer: makeOffer('p-linea', {
      packageId: 'starter-3',
      status: 'sent',
      title: 'Personalizovaná nabídka · Linea Domů',
      personalNote: 'Starter 3 domy — provozní start Linea Domů.',
      updatedAt: '2026-08-01T09:00:00.000Z',
    }),
    order: {
      id: 'order-p-linea',
      partnerId: 'p-linea',
      offerId: 'offer-p-linea',
      packageId: 'starter-3',
      amountCzk: 129_000,
      status: 'waiting_payment',
      confirmedAt: '2026-08-02T10:00:00.000Z',
    },
  },
  {
    partnerId: 'p-blokki',
    stage: 'order_confirmed',
    offer: makeOffer('p-blokki', {
      packageId: 'pilot-1',
      status: 'sent',
      title: 'Personalizovaná nabídka · Blokki',
      personalNote: 'Zakládající partner — Pilot 1 dům.',
      updatedAt: '2026-08-02T12:00:00.000Z',
    }),
    order: {
      id: 'order-p-blokki',
      partnerId: 'p-blokki',
      offerId: 'offer-p-blokki',
      packageId: 'pilot-1',
      amountCzk: 49_000,
      status: 'confirmed',
      confirmedAt: '2026-08-02T14:05:00.000Z',
    },
  },
]);

let cases: OfficeSalesCase[] = SEED_CASES.map((entry) => ({
  ...entry,
  offer: { ...entry.offer },
  order: entry.order === null ? null : { ...entry.order },
}));

function syncPartnerCommercialStatus(
  partnerId: string,
  stage: OfficePipelineStage,
): void {
  const partner = getPartner(partnerId);
  if (partner === null) return;
  const status: OfficePartnerStatus =
    stage === 'prepare_offer' || stage === 'package_selected'
      ? 'lead'
      : stage === 'offer_sent'
        ? 'offer'
        : stage === 'order_confirmed'
          ? 'order'
          : 'payment';
  if (partner.status === status) return;
  const draft = draftFromPartner(partner);
  updatePartner(partnerId, {
    ...draft,
    status,
    nextStep: defaultNextStep(status),
  });
}

function upsertCase(next: OfficeSalesCase): OfficeSalesCase {
  const index = cases.findIndex(
    (entry) => entry.partnerId === next.partnerId,
  );
  if (index < 0) {
    cases = [...cases, next];
  } else {
    cases = cases.map((entry, i) => (i === index ? next : entry));
  }
  return next;
}

function ensureCase(partnerId: string): OfficeSalesCase {
  const existing = cases.find((entry) => entry.partnerId === partnerId);
  if (existing !== undefined) return existing;
  const created: OfficeSalesCase = {
    partnerId,
    stage: 'prepare_offer',
    offer: makeOffer(partnerId, { status: 'draft' }),
    order: null,
  };
  return upsertCase(created);
}

export function listSalesCases(): readonly OfficeSalesCase[] {
  const partnerIds = new Set(listPartners().map((partner) => partner.id));
  for (const partnerId of partnerIds) {
    ensureCase(partnerId);
  }
  return [...cases]
    .filter((entry) => partnerIds.has(entry.partnerId))
    .sort((a, b) => a.partnerId.localeCompare(b.partnerId));
}

export function getSalesCase(partnerId: string): OfficeSalesCase | null {
  if (getPartner(partnerId) === null) return null;
  return ensureCase(partnerId);
}

export function updatePersonalizedOffer(
  partnerId: string,
  input: {
    readonly title: string;
    readonly personalNote: string;
  },
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    title: input.title.trim() || current.offer.title,
    personalNote: input.personalNote.trim(),
    status: current.offer.status === 'sent' ? 'sent' : 'ready',
    updatedAt: nowIso(),
  };
  const stage: OfficePipelineStage =
    current.stage === 'prepare_offer' && current.offer.packageId !== null
      ? 'package_selected'
      : current.stage === 'prepare_offer'
        ? 'prepare_offer'
        : current.stage;
  const next = upsertCase({ ...current, offer, stage });
  appendOfficeEvent({
    kind: 'offer.prepared',
    label: 'Nabídka personalizována',
    detail: `${offer.title}`,
    partnerId,
  });
  return next;
}

export function selectSalesPackage(
  partnerId: string,
  packageId: OfficePackageId,
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  const pkg = getSalesPackage(packageId);
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    packageId,
    status: current.offer.status === 'sent' ? 'sent' : 'ready',
    updatedAt: nowIso(),
  };
  const stage: OfficePipelineStage =
    current.stage === 'offer_sent' ||
    current.stage === 'order_confirmed' ||
    current.stage === 'waiting_payment'
      ? current.stage
      : 'package_selected';
  const next = upsertCase({ ...current, offer, stage });
  appendOfficeEvent({
    kind: 'package.selected',
    label: 'Balíček vybrán',
    detail: `${pkg.name} · ${formatCzk(pkg.priceCzk)}`,
    partnerId,
  });
  return next;
}

export function sendPersonalizedOffer(
  partnerId: string,
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  if (current.offer.packageId === null) return current;
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    status: 'sent',
    updatedAt: nowIso(),
  };
  upsertCase({
    ...current,
    offer,
    stage: 'offer_sent',
  });
  syncPartnerCommercialStatus(partnerId, 'offer_sent');
  appendOfficeEvent({
    kind: 'offer.sent',
    label: 'Nabídka odeslána',
    detail: offer.title,
    partnerId,
  });
  return getSalesCase(partnerId);
}

export function confirmSalesOrder(partnerId: string): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  if (current.offer.packageId === null) return current;
  const pkg = getSalesPackage(current.offer.packageId);
  const order: OfficeOrderSummary = {
    id: `order-${partnerId}`,
    partnerId,
    offerId: current.offer.id,
    packageId: pkg.id,
    amountCzk: pkg.priceCzk,
    status: 'confirmed',
    confirmedAt: nowIso(),
  };
  upsertCase({
    ...current,
    offer: { ...current.offer, status: 'sent' },
    order,
    stage: 'order_confirmed',
  });
  syncPartnerCommercialStatus(partnerId, 'order_confirmed');
  appendOfficeEvent({
    kind: 'order.confirmed',
    label: 'Objednávka potvrzena',
    detail: `${pkg.name} · ${formatCzk(pkg.priceCzk)}`,
    partnerId,
  });
  return getSalesCase(partnerId);
}

export function moveToWaitingPayment(
  partnerId: string,
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null || current.order === null) return current;
  const order: OfficeOrderSummary = {
    ...current.order,
    status: 'waiting_payment',
  };
  upsertCase({
    ...current,
    order,
    stage: 'waiting_payment',
  });
  syncPartnerCommercialStatus(partnerId, 'waiting_payment');
  appendOfficeEvent({
    kind: 'payment.waiting',
    label: 'Čeká na platbu',
    detail: `${formatCzk(order.amountCzk)} · Waiting Payment`,
    partnerId,
  });
  return getSalesCase(partnerId);
}

export function listWaitingPaymentCases(): readonly OfficeSalesCase[] {
  return listSalesCases().filter(
    (entry) => entry.stage === 'waiting_payment',
  );
}

export function resetSalesRegistryForTests(): void {
  cases = SEED_CASES.map((entry) => ({
    ...entry,
    offer: { ...entry.offer },
    order: entry.order === null ? null : { ...entry.order },
  }));
}
