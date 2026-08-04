/**
 * PT-13 — Canonical commercial business events.
 * Workflow / Commercial Experience publish; Automation decides reactions.
 * Pure domain — no React · no HTTP · no mail transport.
 */

export type BusinessEventKind =
  | 'OfferAccepted'
  | 'OrderConfirmed'
  | 'ProformaGenerated'
  | 'PaymentConfirmed'
  | 'PilotReady'
  | 'WorkflowMessageReceived'
  | 'WorkflowMessageSent';

/** Stable catalog — extend without refactoring Runtime. */
export const BUSINESS_EVENT_KINDS: readonly BusinessEventKind[] = Object.freeze([
  'OfferAccepted',
  'OrderConfirmed',
  'ProformaGenerated',
  'PaymentConfirmed',
  'PilotReady',
  'WorkflowMessageReceived',
  'WorkflowMessageSent',
]);

export type BusinessEventSource =
  | 'offer-experience'
  | 'office-workflow'
  | 'conversation'
  | 'mail-session'
  | 'system';

export type BusinessEventPayload = Readonly<Record<string, string | number | boolean | null>>;

export type BusinessEvent = {
  readonly id: string;
  readonly kind: BusinessEventKind;
  readonly occurredAt: string;
  readonly source: BusinessEventSource;
  readonly correlationId: string | null;
  readonly payload: BusinessEventPayload;
};

export function isBusinessEventKind(value: string): value is BusinessEventKind {
  return (BUSINESS_EVENT_KINDS as readonly string[]).includes(value);
}

export function createBusinessEventId(kind: BusinessEventKind, stamp = Date.now()): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `ba-${kind}-${stamp.toString(36)}-${rand}`;
}

export function buildBusinessEvent(input: {
  readonly kind: BusinessEventKind;
  readonly occurredAt?: string;
  readonly source: BusinessEventSource;
  readonly correlationId?: string | null;
  readonly payload?: BusinessEventPayload;
  readonly id?: string;
}): BusinessEvent {
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  return {
    id: input.id ?? createBusinessEventId(input.kind),
    kind: input.kind,
    occurredAt,
    source: input.source,
    correlationId: input.correlationId ?? null,
    payload: input.payload ?? {},
  };
}
