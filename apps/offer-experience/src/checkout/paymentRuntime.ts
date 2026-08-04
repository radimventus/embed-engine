/**
 * CAP-CE-03 — Payment Experience runtime (local UI state + integration payloads).
 * No backend · no Office · no automatic payment matching.
 */

import type { CheckoutConfirmedOrder } from './checkoutRuntime';

/** Demo CONIS settlement account — replace via payment integrations later. */
export const OFFER_PAYMENT_DEMO_IBAN = 'CZ6508000000192000145399' as const;
export const OFFER_PAYMENT_DEMO_ACCOUNT = '19-2000145399/0800' as const;
export const OFFER_PAYMENT_DEMO_BANK = 'Česká spořitelna' as const;

export type OfferPaymentStatus =
  | 'awaiting'
  | 'processing'
  | 'paid'
  | 'failed';

export type OfferProformaDocument = {
  readonly proformaId: string;
  readonly number: string;
  readonly orderId: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly companyName: string;
  readonly ico: string | null;
  readonly partnerName: string;
  readonly packageName: string;
  readonly packageId: string;
  readonly bankAccount: string;
  readonly iban: string;
  readonly bankName: string;
  readonly variableSymbol: string;
  /** Future PDF / download URL — null until PT document integration. */
  readonly documentUrl: string | null;
};

export type OfferQrPaymentCard = {
  readonly orderId: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly iban: string;
  readonly variableSymbol: string;
  readonly message: string;
  /** SPD*1.0 payload for bank QR scanners / future image encoding. */
  readonly spdPayload: string;
  /** Optional rendered QR image from a future adapter. */
  readonly imageDataUrl: string | null;
};

export type OfferPaymentSessionState = {
  readonly sessionId: string;
  readonly status: OfferPaymentStatus;
  readonly checkedAt: string | null;
  readonly paidAt: string | null;
  readonly failureReason: string | null;
};

export type OfferOfficeHandoffPayload = {
  readonly orderId: string;
  readonly proformaId: string;
  readonly proformaNumber: string;
  readonly offerSlug: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly contactEmail: string;
  readonly contactName: string;
  readonly packageId: string;
  readonly packageName: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly variableSymbol: string;
  readonly paidAt: string;
};

export type OfferOfficeHandoffResult = {
  readonly handoffId: string;
  readonly status: 'queued' | 'accepted' | 'rejected';
};

export type OfferPaymentIntegrations = {
  readonly issueProforma?: (
    order: CheckoutConfirmedOrder,
  ) => Promise<OfferProformaDocument> | OfferProformaDocument;
  readonly buildQrPayment?: (
    order: CheckoutConfirmedOrder,
    proforma: OfferProformaDocument,
  ) => Promise<OfferQrPaymentCard> | OfferQrPaymentCard;
  readonly checkPaymentStatus?: (
    session: OfferPaymentSessionState,
    order: CheckoutConfirmedOrder,
  ) => Promise<OfferPaymentSessionState> | OfferPaymentSessionState;
  readonly handoffToOffice?: (
    payload: OfferOfficeHandoffPayload,
  ) => Promise<OfferOfficeHandoffResult> | OfferOfficeHandoffResult;
};

export function buildVariableSymbol(orderId: string): string {
  const digits = orderId.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-10);
  const fallback = orderId.replace(/[^0-9A-Z]/gi, '');
  let hash = 0;
  for (let i = 0; i < fallback.length; i += 1) {
    hash = (hash * 31 + fallback.charCodeAt(i)) % 1_000_000_000;
  }
  return String(Math.abs(hash)).padStart(10, '0').slice(-10);
}

export function buildSpdPayload(input: {
  readonly iban: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly message: string;
}): string {
  const amount = input.amountCzk.toFixed(2);
  const msg = input.message.replace(/\*/g, ' ').slice(0, 60);
  return [
    'SPD*1.0',
    `ACC:${input.iban}`,
    `AM:${amount}`,
    'CC:CZK',
    `X-VS:${input.variableSymbol}`,
    `MSG:${msg}`,
  ].join('*');
}

export function createLocalProformaId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `PF-${stamp}-${rand}`;
}

export function createLocalPaymentSessionId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `PAY-${stamp}-${rand}`;
}

export function issueLocalProforma(
  order: CheckoutConfirmedOrder,
  issuedAt: string = new Date().toISOString(),
): OfferProformaDocument {
  const due = new Date(issuedAt);
  due.setDate(due.getDate() + 14);
  const variableSymbol = buildVariableSymbol(order.orderId);
  const proformaId = createLocalProformaId();
  return {
    proformaId,
    number: proformaId,
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    issuedAt,
    dueDate: due.toISOString(),
    companyName: order.contact.companyName,
    ico: order.contact.ico.length > 0 ? order.contact.ico : null,
    partnerName: order.partnerName,
    packageName: order.packageName,
    packageId: order.packageId,
    bankAccount: OFFER_PAYMENT_DEMO_ACCOUNT,
    iban: OFFER_PAYMENT_DEMO_IBAN,
    bankName: OFFER_PAYMENT_DEMO_BANK,
    variableSymbol,
    documentUrl: null,
  };
}

export function buildLocalQrPaymentCard(
  order: CheckoutConfirmedOrder,
  proforma: OfferProformaDocument,
): OfferQrPaymentCard {
  const message = `CONIS ${order.packageName} · ${order.partnerName}`;
  return {
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    iban: proforma.iban,
    variableSymbol: proforma.variableSymbol,
    message,
    spdPayload: buildSpdPayload({
      iban: proforma.iban,
      amountCzk: order.priceCzk,
      variableSymbol: proforma.variableSymbol,
      message,
    }),
    imageDataUrl: null,
  };
}

export function createLocalPaymentSession(
  now: string = new Date().toISOString(),
): OfferPaymentSessionState {
  return {
    sessionId: createLocalPaymentSessionId(),
    status: 'awaiting',
    checkedAt: now,
    paidAt: null,
    failureReason: null,
  };
}

export function markPaymentProcessing(
  session: OfferPaymentSessionState,
  now: string = new Date().toISOString(),
): OfferPaymentSessionState {
  return {
    ...session,
    status: 'processing',
    checkedAt: now,
    failureReason: null,
  };
}

export function markPaymentPaid(
  session: OfferPaymentSessionState,
  now: string = new Date().toISOString(),
): OfferPaymentSessionState {
  return {
    ...session,
    status: 'paid',
    checkedAt: now,
    paidAt: now,
    failureReason: null,
  };
}

export function markPaymentFailed(
  session: OfferPaymentSessionState,
  reason: string,
  now: string = new Date().toISOString(),
): OfferPaymentSessionState {
  return {
    ...session,
    status: 'failed',
    checkedAt: now,
    failureReason: reason,
  };
}

export function buildOfficeHandoffPayload(
  order: CheckoutConfirmedOrder,
  proforma: OfferProformaDocument,
  paidAt: string,
): OfferOfficeHandoffPayload {
  return {
    orderId: order.orderId,
    proformaId: proforma.proformaId,
    proformaNumber: proforma.number,
    offerSlug: order.offerSlug,
    partnerName: order.partnerName,
    companyName: order.contact.companyName,
    contactEmail: order.contact.email,
    contactName: order.contact.contactName,
    packageId: order.packageId,
    packageName: order.packageName,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    variableSymbol: proforma.variableSymbol,
    paidAt,
  };
}

export function formatOfferDueDate(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}
