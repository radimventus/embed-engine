/**
 * CAP-CE-03 — Payment Experience domain types.
 * No backend · no Office · prepared for integrations.
 */

import type { CheckoutConfirmedOrder } from '../checkout/checkoutRuntime';

export type OfferPaymentStep = 'proforma' | 'qr' | 'complete';

/** Commercial payment lifecycle shown in UI. */
export type OfferPaymentLifecycle =
  | 'waiting_payment'
  | 'payment_received'
  | 'pilot_ready';

export type OfferProformaStatus = 'issued' | 'awaiting_payment' | 'paid';

export type OfferProformaDocument = {
  readonly proformaId: string;
  readonly number: string;
  readonly partnerName: string;
  readonly companyName: string;
  readonly packageId: string;
  readonly packageName: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly issuedAt: string;
  readonly dueDate: string;
  readonly status: OfferProformaStatus;
  readonly orderId: string;
  readonly ico: string | null;
  readonly variableSymbol: string;
  readonly accountNumber: string;
  readonly iban: string;
  readonly spdPayload: string;
  readonly pdfDataUrl: string;
};

export type OfferQrPaymentCard = {
  readonly orderId: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly accountNumber: string;
  readonly iban: string;
  readonly variableSymbol: string;
  readonly message: string;
  /** SPD bank QR string (encoded into QR image in UI). */
  readonly qrPayload: string;
  /** Optional pre-rendered QR image; otherwise generated from qrPayload. */
  readonly imageDataUrl: string | null;
};

export type OfferPaymentRuntimeState = {
  readonly step: OfferPaymentStep;
  readonly lifecycle: OfferPaymentLifecycle;
  readonly proforma: OfferProformaDocument | null;
  readonly qr: OfferQrPaymentCard | null;
  readonly paidAt: string | null;
  readonly error: string | null;
};

/** CONIS settlement account for partner payments. */
export const OFFER_PAYMENT_ACCOUNT = Object.freeze({
  accountNumber: '2303345128/2010',
  iban: 'CZ1520100000002303345128',
  bankName: 'Fio banka',
});

export function createEmptyPaymentState(): OfferPaymentRuntimeState {
  return {
    step: 'proforma',
    lifecycle: 'waiting_payment',
    proforma: null,
    qr: null,
    paidAt: null,
    error: null,
  };
}

export function createClientProformaId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `PF-${stamp}-${rand}`;
}

export function createProformaNumber(orderId: string): string {
  const digits = orderId.replace(/[^0-9A-Z]/gi, '').slice(-8);
  return `PF-2026-${digits || '00000000'}`;
}

export function variableSymbolFromOrderId(orderId: string): string {
  const digits = orderId.replace(/\D/g, '');
  if (digits.length >= 6) return digits.slice(-10);
  return orderId.replace(/[^0-9A-Z]/gi, '').slice(-10);
}

export function dueDateFromIssuedAt(issuedAt: string, days = 14): string {
  const date = new Date(issuedAt);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

/**
 * Czech SPD short payment descriptor (text QR). Backend may replace later.
 */
export function buildSpdQrPayload(input: {
  readonly iban: string;
  readonly amountCzk: number;
  readonly variableSymbol: string;
  readonly message: string;
}): string {
  const amount = input.amountCzk.toFixed(2);
  const msg = input.message.replace(/[\r\n*]/g, ' ').slice(0, 60);
  return [
    'SPD*1.0',
    `ACC:${input.iban}`,
    `AM:${amount}`,
    'CC:CZK',
    `X-VS:${input.variableSymbol}`,
    `MSG:${msg}`,
  ].join('*');
}

export function issueLocalProforma(
  order: CheckoutConfirmedOrder,
  issuedAt: string,
  proformaId = createClientProformaId(),
): OfferProformaDocument {
  return {
    proformaId,
    number: createProformaNumber(order.orderId),
    partnerName: order.partnerName,
    companyName: order.contact.companyName,
    packageId: order.packageId,
    packageName: order.packageName,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    issuedAt,
    dueDate: dueDateFromIssuedAt(issuedAt),
    status: 'issued',
    orderId: order.orderId,
    ico: order.contact.ico.length > 0 ? order.contact.ico : null,
    variableSymbol: variableSymbolFromOrderId(order.orderId),
    accountNumber: OFFER_PAYMENT_ACCOUNT.accountNumber,
    iban: OFFER_PAYMENT_ACCOUNT.iban,
    spdPayload: buildSpdQrPayload({
      iban: OFFER_PAYMENT_ACCOUNT.iban,
      amountCzk: order.priceCzk,
      variableSymbol: variableSymbolFromOrderId(order.orderId),
      message: `CONIS ${order.packageName} · ${order.partnerName}`,
    }),
    pdfDataUrl: '',
  };
}

export function buildLocalQrPaymentCard(
  order: CheckoutConfirmedOrder,
): OfferQrPaymentCard {
  const variableSymbol = variableSymbolFromOrderId(order.orderId);
  const message = `CONIS ${order.packageName} · ${order.partnerName}`;
  const qrPayload = buildSpdQrPayload({
    iban: OFFER_PAYMENT_ACCOUNT.iban,
    amountCzk: order.priceCzk,
    variableSymbol,
    message,
  });
  return {
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    accountNumber: OFFER_PAYMENT_ACCOUNT.accountNumber,
    iban: OFFER_PAYMENT_ACCOUNT.iban,
    variableSymbol,
    message,
    qrPayload,
    imageDataUrl: null,
  };
}

export function buildDurableQrPaymentCard(proforma: OfferProformaDocument): OfferQrPaymentCard {
  return {
    orderId: proforma.orderId,
    amountCzk: proforma.amountCzk,
    currency: 'CZK',
    accountNumber: proforma.accountNumber,
    iban: proforma.iban,
    variableSymbol: proforma.variableSymbol,
    message: `CONIS ${proforma.packageName} · ${proforma.partnerName}`,
    qrPayload: proforma.spdPayload,
    imageDataUrl: null,
  };
}

export function formatOfferDateCs(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(new Date(iso));
}

export function paymentLifecycleLabel(
  lifecycle: OfferPaymentLifecycle,
): string {
  switch (lifecycle) {
    case 'waiting_payment':
      return 'Čeká na platbu';
    case 'payment_received':
      return 'Platba zaevidována';
    case 'pilot_ready':
      return 'Připraveno ke spuštění';
    default: {
      const _exhaustive: never = lifecycle;
      return _exhaustive;
    }
  }
}

export function proformaStatusLabel(status: OfferProformaStatus): string {
  switch (status) {
    case 'issued':
      return 'Vystaveno';
    case 'awaiting_payment':
      return 'Čeká na platbu';
    case 'paid':
      return 'Uhrazeno';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
