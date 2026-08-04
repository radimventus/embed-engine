/**
 * CAP-CE-02 — Extension points for PT-03 (Proforma · QR · Payment · Timeline).
 * Interfaces only — no backend / payment implementation.
 */

import type { CheckoutConfirmedOrder } from './checkoutRuntime';

/** Future proforma document issued after order confirmation. */
export type OfferProformaRequest = {
  readonly orderId: string;
  readonly amountCzk: number;
  readonly partnerName: string;
  readonly companyName: string;
  readonly ico: string | null;
  readonly packageId: string;
};

export type OfferProformaResult = {
  readonly proformaId: string;
  readonly documentUrl: string | null;
  readonly dueDate: string | null;
};

/** Future QR payment payload (e.g. SPD / bank QR). */
export type OfferQrPaymentPayload = {
  readonly orderId: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly variableSymbol: string;
  readonly message: string;
};

export type OfferQrPaymentResult = {
  readonly qrPayload: string;
  readonly imageDataUrl: string | null;
};

/** Future payment session / gateway handoff. */
export type OfferPaymentSessionRequest = {
  readonly orderId: string;
  readonly amountCzk: number;
  readonly currency: 'CZK';
  readonly returnUrl: string;
  readonly cancelUrl: string;
};

export type OfferPaymentSessionResult = {
  readonly sessionId: string;
  readonly checkoutUrl: string | null;
  readonly status: 'pending' | 'ready' | 'failed';
};

/** Future commercial timeline event emitted after confirmation. */
export type OfferTimelineEvent = {
  readonly type: 'offer.order.confirmed';
  readonly occurredAt: string;
  readonly orderId: string;
  readonly offerSlug: string;
  readonly packageId: string;
  readonly amountCzk: number;
  readonly partnerName: string;
};

export type OfferCheckoutIntegrations = {
  readonly createProforma?: (
    request: OfferProformaRequest,
  ) => Promise<OfferProformaResult>;
  readonly createQrPayment?: (
    payload: OfferQrPaymentPayload,
  ) => Promise<OfferQrPaymentResult>;
  readonly createPaymentSession?: (
    request: OfferPaymentSessionRequest,
  ) => Promise<OfferPaymentSessionResult>;
  readonly emitTimelineEvent?: (
    event: OfferTimelineEvent,
  ) => Promise<void> | void;
};

/**
 * Build PT-03-ready payloads from a confirmed order.
 * Callers / future adapters consume these without refactoring checkout UI.
 */
export function buildProformaRequest(
  order: CheckoutConfirmedOrder,
): OfferProformaRequest {
  return {
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    partnerName: order.partnerName,
    companyName: order.contact.companyName,
    ico: order.contact.ico.length > 0 ? order.contact.ico : null,
    packageId: order.packageId,
  };
}

export function buildQrPaymentPayload(
  order: CheckoutConfirmedOrder,
): OfferQrPaymentPayload {
  return {
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    variableSymbol: order.orderId.replace(/[^0-9A-Z]/gi, '').slice(-10),
    message: `CONIS ${order.packageName} · ${order.partnerName}`,
  };
}

export function buildPaymentSessionRequest(
  order: CheckoutConfirmedOrder,
  urls: { readonly returnUrl: string; readonly cancelUrl: string },
): OfferPaymentSessionRequest {
  return {
    orderId: order.orderId,
    amountCzk: order.priceCzk,
    currency: 'CZK',
    returnUrl: urls.returnUrl,
    cancelUrl: urls.cancelUrl,
  };
}

export function buildOrderConfirmedTimelineEvent(
  order: CheckoutConfirmedOrder,
): OfferTimelineEvent {
  return {
    type: 'offer.order.confirmed',
    occurredAt: order.confirmedAt,
    orderId: order.orderId,
    offerSlug: order.offerSlug,
    packageId: order.packageId,
    amountCzk: order.priceCzk,
    partnerName: order.partnerName,
  };
}

/**
 * Optional hook invoked after local confirmation.
 * Default no-op integrations keep Commercial Experience offline-ready.
 */
export async function notifyCheckoutExtensions(
  order: CheckoutConfirmedOrder,
  integrations: OfferCheckoutIntegrations = {},
): Promise<void> {
  const event = buildOrderConfirmedTimelineEvent(order);
  await integrations.emitTimelineEvent?.(event);
}
