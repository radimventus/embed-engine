/**
 * OF-03 / PE-09 — Pilot Offer & Checkout registry (in-memory MVP).
 * Select package → create offer → send offer. No payment gateway / PE provisioning.
 */

import { appendOfficeEvent, listPartnerTimeline } from './officeEventCatalog';
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
  computeOfferValidUntil,
  formatCzk,
  getSalesPackage,
  normalizePackageId,
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

function emptyOfferFields(): Pick<
  OfficePersonalizedOffer,
  | 'priceCzk'
  | 'licenseHouses'
  | 'trialDays'
  | 'validUntil'
  | 'viewedAt'
  | 'acceptedAt'
> {
  return {
    priceCzk: null,
    licenseHouses: null,
    trialDays: null,
    validUntil: null,
    viewedAt: null,
    acceptedAt: null,
  };
}

function makeOffer(
  partnerId: string,
  partial: Partial<OfficePersonalizedOffer> & {
    readonly status: OfficeOfferStatus;
  },
): OfficePersonalizedOffer {
  const partner = getPartner(partnerId);
  const name = partner?.name ?? 'Partner';
  const packageId =
    partial.packageId != null
      ? normalizePackageId(partial.packageId)
      : null;
  return {
    id: `offer-${partnerId}`,
    partnerId,
    packageId,
    title: partial.title ?? `Pilot nabídka · ${name}`,
    personalNote:
      partial.personalNote ??
      `Nabídka pilotního programu CONIS Embed pro ${name}.`,
    status: partial.status,
    updatedAt: partial.updatedAt ?? nowIso(),
    priceCzk: partial.priceCzk ?? null,
    licenseHouses: partial.licenseHouses ?? null,
    trialDays: partial.trialDays ?? null,
    validUntil: partial.validUntil ?? null,
    viewedAt: partial.viewedAt ?? null,
    acceptedAt: partial.acceptedAt ?? null,
  };
}

function normalizeOffer(offer: OfficePersonalizedOffer): OfficePersonalizedOffer {
  return {
    ...emptyOfferFields(),
    ...offer,
    packageId:
      offer.packageId != null ? normalizePackageId(offer.packageId) : null,
  };
}

function normalizeCase(entry: OfficeSalesCase): OfficeSalesCase {
  return {
    ...entry,
    offer: normalizeOffer(entry.offer),
    order:
      entry.order === null
        ? null
        : {
            ...entry.order,
            packageId: normalizePackageId(entry.order.packageId),
          },
  };
}

const SEED_CASES: readonly OfficeSalesCase[] = Object.freeze([
  {
    partnerId: 'p-nord',
    stage: 'offer_sent',
    offer: makeOffer('p-nord', {
      packageId: 'pilot',
      status: 'sent',
      title: 'Pilot nabídka · Nordhaus',
      personalNote:
        'Pilot — 1 dům pro Nordhaus · Embed Experience na partnerském webu.',
      updatedAt: '2026-08-02T11:40:00.000Z',
      priceCzk: 4_970,
      licenseHouses: 1,
      trialDays: 90,
      validUntil: '2026-08-16T11:40:00.000Z',
    }),
    order: null,
  },
  {
    partnerId: 'p-linea',
    stage: 'waiting_payment',
    offer: makeOffer('p-linea', {
      packageId: 'starter',
      status: 'sent',
      title: 'Pilot nabídka · Linea Domů',
      personalNote: 'Starter — až 3 domy · provozní start Linea Domů.',
      updatedAt: '2026-08-01T09:00:00.000Z',
      priceCzk: 14_970,
      licenseHouses: 3,
      trialDays: 90,
      validUntil: '2026-08-15T09:00:00.000Z',
    }),
    order: {
      id: 'order-p-linea',
      partnerId: 'p-linea',
      offerId: 'offer-p-linea',
      packageId: 'starter',
      amountCzk: 14_970,
      status: 'waiting_payment',
      confirmedAt: '2026-08-02T10:00:00.000Z',
    },
  },
  {
    partnerId: 'p-blokki',
    stage: 'order_confirmed',
    offer: makeOffer('p-blokki', {
      packageId: 'pilot',
      status: 'accepted',
      title: 'Pilot nabídka · Blokki',
      personalNote: 'Zakládající partner — Pilot 1 dům.',
      updatedAt: '2026-08-02T12:00:00.000Z',
      priceCzk: 4_970,
      licenseHouses: 1,
      trialDays: 90,
      validUntil: '2026-08-16T12:00:00.000Z',
      acceptedAt: '2026-08-02T14:05:00.000Z',
    }),
    order: {
      id: 'order-p-blokki',
      partnerId: 'p-blokki',
      offerId: 'offer-p-blokki',
      packageId: 'pilot',
      amountCzk: 4_970,
      status: 'confirmed',
      confirmedAt: '2026-08-02T14:05:00.000Z',
    },
  },
]);

let cases: OfficeSalesCase[] = SEED_CASES.map((entry) => normalizeCase(entry));

function syncPartnerCommercialStatus(
  partnerId: string,
  stage: OfficePipelineStage,
  nextStepOverride?: string,
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
  const draft = draftFromPartner(partner);
  updatePartner(partnerId, {
    ...draft,
    status,
    nextStep: nextStepOverride ?? defaultNextStep(status),
  });
}

function upsertCase(next: OfficeSalesCase): OfficeSalesCase {
  const normalized = normalizeCase(next);
  const index = cases.findIndex(
    (entry) => entry.partnerId === normalized.partnerId,
  );
  if (index < 0) {
    cases = [...cases, normalized];
  } else {
    cases = cases.map((entry, i) => (i === index ? normalized : entry));
  }
  return normalized;
}

function ensureCase(partnerId: string): OfficeSalesCase {
  const existing = cases.find((entry) => entry.partnerId === partnerId);
  if (existing !== undefined) return normalizeCase(existing);
  const created: OfficeSalesCase = {
    partnerId,
    stage: 'prepare_offer',
    offer: makeOffer(partnerId, { status: 'draft' }),
    order: null,
  };
  return upsertCase(created);
}

function hasTimelineKind(partnerId: string, kind: string): boolean {
  return listPartnerTimeline(partnerId, 80).some(
    (event) => event.kind === kind,
  );
}

export function listSalesCases(): readonly OfficeSalesCase[] {
  const partnerIds = new Set(listPartners().map((partner) => partner.id));
  for (const partnerId of partnerIds) {
    ensureCase(partnerId);
  }
  return [...cases]
    .filter((entry) => partnerIds.has(entry.partnerId))
    .map(normalizeCase)
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
    status:
      current.offer.status === 'sent' || current.offer.status === 'accepted'
        ? current.offer.status
        : 'ready',
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

/**
 * PE-09 — select Pilot package, persist to partner case, build offer snapshot.
 */
export function selectSalesPackage(
  partnerId: string,
  packageId: OfficePackageId | string,
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  const pkg = getSalesPackage(packageId);
  const stamp = nowIso();
  const createdBefore = current.offer.packageId === null;
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    packageId: pkg.id,
    status:
      current.offer.status === 'sent' || current.offer.status === 'accepted'
        ? current.offer.status
        : 'ready',
    updatedAt: stamp,
    priceCzk: pkg.priceCzk,
    licenseHouses: pkg.houses,
    trialDays: pkg.trialDays,
    validUntil: computeOfferValidUntil(stamp),
  };
  const stage: OfficePipelineStage =
    current.stage === 'offer_sent' ||
    current.stage === 'order_confirmed' ||
    current.stage === 'waiting_payment'
      ? current.stage
      : 'package_selected';
  const next = upsertCase({ ...current, offer, stage });

  if (createdBefore && !hasTimelineKind(partnerId, 'offer.created')) {
    appendOfficeEvent({
      kind: 'offer.created',
      label: 'Nabídka vytvořena',
      detail: `${pkg.name} · ${formatCzk(pkg.priceCzk)} · ${pkg.housesLabel}`,
      partnerId,
    });
  }

  appendOfficeEvent({
    kind: 'package.selected',
    label: 'PackageSelected',
    detail: `${pkg.name} · ${formatCzk(pkg.priceCzk)} · ${pkg.housesLabel}`,
    partnerId,
  });

  if (stage === 'package_selected') {
    syncPartnerCommercialStatus(
      partnerId,
      'package_selected',
      `Balíček ${pkg.name} — pokračovat na checkout`,
    );
  }

  return getSalesCase(partnerId) ?? next;
}

/**
 * PE-09 — send pilot offer (local stamp, no SMTP). Prepares commercial path for PE-10.
 */
export function sendPersonalizedOffer(
  partnerId: string,
): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  if (current.offer.packageId === null) return current;
  const pkg = getSalesPackage(current.offer.packageId);
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
  syncPartnerCommercialStatus(
    partnerId,
    'offer_sent',
    'Připravit pilot',
  );
  appendOfficeEvent({
    kind: 'offer.sent',
    label: 'Nabídka odeslána',
    detail: `${offer.title} · ${pkg.name} · ${formatCzk(pkg.priceCzk)}`,
    partnerId,
  });
  return getSalesCase(partnerId);
}

/** PE-09 — OfferViewed (local MVP when offer surface is opened). */
export function markOfferViewed(partnerId: string): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  if (current.offer.viewedAt !== null) {
    return current;
  }
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    viewedAt: nowIso(),
    updatedAt: nowIso(),
    status: current.offer.status === 'draft' ? 'ready' : current.offer.status,
  };
  upsertCase({ ...current, offer });
  if (!hasTimelineKind(partnerId, 'offer.viewed')) {
    appendOfficeEvent({
      kind: 'offer.viewed',
      label: 'OfferViewed',
      detail: offer.title,
      partnerId,
    });
  }
  return getSalesCase(partnerId);
}

/**
 * PE-09 — Checkout MVP: confirm package selection into an order (no payment gateway).
 */
export function confirmSalesOrder(partnerId: string): OfficeSalesCase | null {
  const current = getSalesCase(partnerId);
  if (current === null) return null;
  if (current.offer.packageId === null) return current;
  const pkg = getSalesPackage(current.offer.packageId);
  const stamp = nowIso();
  const offer: OfficePersonalizedOffer = {
    ...current.offer,
    status: 'accepted',
    acceptedAt: current.offer.acceptedAt ?? stamp,
    updatedAt: stamp,
  };
  const order: OfficeOrderSummary = {
    id: `order-${partnerId}`,
    partnerId,
    offerId: current.offer.id,
    packageId: pkg.id,
    amountCzk: pkg.priceCzk,
    status: 'confirmed',
    confirmedAt: stamp,
  };
  upsertCase({
    ...current,
    offer,
    order,
    stage: 'order_confirmed',
  });
  syncPartnerCommercialStatus(
    partnerId,
    'order_confirmed',
    'Objednávka potvrzena — připravit pilot',
  );
  appendOfficeEvent({
    kind: 'order.confirmed',
    label: 'OrderConfirmed',
    detail: `${pkg.name} · ${formatCzk(pkg.priceCzk)}`,
    partnerId,
  });
  return getSalesCase(partnerId);
}

/** @deprecated Prefer confirmSalesOrder — kept for earlier PE-09 drafts. */
export function acceptPilotOfferPlaceholder(
  partnerId: string,
): OfficeSalesCase | null {
  return confirmSalesOrder(partnerId);
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
  cases = SEED_CASES.map((entry) => normalizeCase(entry));
}
