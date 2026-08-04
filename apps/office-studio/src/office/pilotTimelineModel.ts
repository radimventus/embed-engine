/**
 * CAP-OP-04 / PT-07 — Timeline Runtime domain (Event Catalog projection).
 * Not a workflow · not a mail client · mock store only (no persistence).
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotTimelineEventKind =
  | 'email.received'
  | 'email.sent'
  | 'note.added'
  | 'offer.sent'
  | 'offer.viewed'
  | 'order.confirmed'
  | 'payment.received'
  | 'builder.ready'
  | 'document.generated'
  | 'document.attached'
  | 'document.sent'
  | 'workflow.synced'
  | 'office.task';

export type PilotTimelineEventId = string;

export type PilotTimelineEvent = {
  readonly id: PilotTimelineEventId;
  readonly caseId: PilotWorkspaceCaseId;
  readonly kind: PilotTimelineEventKind;
  readonly title: string;
  readonly summary: string;
  readonly detail: string;
  readonly occurredAt: string;
};

export type PilotTimelineDayGroup = {
  readonly dayKey: string;
  readonly dayLabel: string;
  readonly events: readonly PilotTimelineEvent[];
};

export const PILOT_TIMELINE_EVENT_KIND_LABELS: Readonly<
  Record<PilotTimelineEventKind, string>
> = Object.freeze({
  'email.received': 'Email Received',
  'email.sent': 'Email Sent',
  'note.added': 'Note Added',
  'offer.sent': 'Offer Sent',
  'offer.viewed': 'Offer Viewed',
  'order.confirmed': 'Order Confirmed',
  'payment.received': 'Payment Received',
  'builder.ready': 'Builder Ready',
  'document.generated': 'Document Generated',
  'document.attached': 'Document Attached',
  'document.sent': 'Document Sent',
  'workflow.synced': 'Workflow Synced',
  'office.task': 'Office Task',
});

/** Short icon glyph per event kind (CSS-styled, not emoji). */
export const PILOT_TIMELINE_EVENT_ICONS: Readonly<
  Record<PilotTimelineEventKind, string>
> = Object.freeze({
  'email.received': 'IN',
  'email.sent': 'OUT',
  'note.added': 'NOTE',
  'offer.sent': 'OFF',
  'offer.viewed': 'VIEW',
  'order.confirmed': 'ORD',
  'payment.received': 'PAY',
  'builder.ready': 'BLD',
  'document.generated': 'DOC',
  'document.attached': 'ATT',
  'document.sent': 'SND',
  'workflow.synced': 'WF',
  'office.task': 'TASK',
});

export function formatTimelineDayKey(iso: string): string {
  return iso.slice(0, 10);
}

export function formatTimelineDayLabel(dayKey: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${dayKey}T12:00:00.000Z`));
}

export function formatTimelineTime(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatTimelineDateTime(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/**
 * Chronological descending (newest first), grouped by calendar day.
 */
export function groupTimelineEventsByDay(
  events: readonly PilotTimelineEvent[],
): readonly PilotTimelineDayGroup[] {
  const sorted = events
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const groups = new Map<string, PilotTimelineEvent[]>();
  for (const event of sorted) {
    const dayKey = formatTimelineDayKey(event.occurredAt);
    const bucket = groups.get(dayKey);
    if (bucket === undefined) {
      groups.set(dayKey, [event]);
    } else {
      bucket.push(event);
    }
  }

  return Array.from(groups.entries()).map(([dayKey, dayEvents]) => ({
    dayKey,
    dayLabel: formatTimelineDayLabel(dayKey),
    events: dayEvents,
  }));
}
