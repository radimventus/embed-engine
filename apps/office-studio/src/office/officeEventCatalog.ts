/**
 * OF-01 / OF-02 — Office Event Catalog (MVP fixture + live timeline source).
 * Not a platform Event Engine — local catalog for Office dashboard / Partner Timeline.
 */

export type OfficeEventKind =
  | 'partner.created'
  | 'partner.updated'
  | 'offer.prepared'
  | 'package.selected'
  | 'offer.sent'
  | 'order.confirmed'
  | 'payment.waiting'
  | 'payment.received'
  | 'builder.opened';

export type OfficeEvent = {
  readonly id: string;
  readonly kind: OfficeEventKind;
  readonly label: string;
  readonly detail: string;
  readonly occurredAt: string;
  readonly partnerId: string | null;
};

const SEED_EVENTS: readonly OfficeEvent[] = Object.freeze([
  {
    id: 'evt-001',
    kind: 'partner.created',
    label: 'Partner vytvořen',
    detail: 'Blokki · zakládající partner',
    occurredAt: '2026-08-02T09:12:00.000Z',
    partnerId: 'p-blokki',
  },
  {
    id: 'evt-002',
    kind: 'offer.sent',
    label: 'Nabídka odeslána',
    detail: 'Pilotní nasazení · 1 dům',
    occurredAt: '2026-08-02T11:40:00.000Z',
    partnerId: 'p-nord',
  },
  {
    id: 'evt-003',
    kind: 'order.confirmed',
    label: 'Objednávka potvrzena',
    detail: 'Blokki · potvrzení pilotu',
    occurredAt: '2026-08-02T14:05:00.000Z',
    partnerId: 'p-blokki',
  },
  {
    id: 'evt-004',
    kind: 'payment.received',
    label: 'Platba přijata',
    detail: 'Pilotní poplatek · uhrazeno',
    occurredAt: '2026-08-02T16:22:00.000Z',
    partnerId: 'p-linea',
  },
  {
    id: 'evt-005',
    kind: 'builder.opened',
    label: 'Builder otevřen',
    detail: 'Projekt Blokki · dům P1',
    occurredAt: '2026-08-03T07:05:00.000Z',
    partnerId: 'p-blokki',
  },
  {
    id: 'evt-006',
    kind: 'partner.created',
    label: 'Partner vytvořen',
    detail: 'Nordhaus · obchodní pipeline',
    occurredAt: '2026-07-28T10:00:00.000Z',
    partnerId: 'p-nord',
  },
  {
    id: 'evt-007',
    kind: 'partner.created',
    label: 'Partner vytvořen',
    detail: 'Linea Domů · pilotní partner',
    occurredAt: '2026-07-20T08:30:00.000Z',
    partnerId: 'p-linea',
  },
]);

let events: OfficeEvent[] = SEED_EVENTS.map((event) => ({ ...event }));
let eventSeq = 700;

export const OFFICE_EVENT_CATALOG: readonly OfficeEvent[] = SEED_EVENTS;

export function listRecentOfficeEvents(limit = 8): readonly OfficeEvent[] {
  return [...events]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}

export function listPartnerTimeline(
  partnerId: string,
  limit = 24,
): readonly OfficeEvent[] {
  return [...events]
    .filter((event) => event.partnerId === partnerId)
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    )
    .slice(0, limit);
}

export function appendOfficeEvent(input: {
  readonly kind: OfficeEventKind;
  readonly label: string;
  readonly detail: string;
  readonly partnerId: string | null;
}): OfficeEvent {
  eventSeq += 1;
  const event: OfficeEvent = {
    id: `evt-${eventSeq}`,
    kind: input.kind,
    label: input.label,
    detail: input.detail,
    occurredAt: new Date().toISOString(),
    partnerId: input.partnerId,
  };
  events = [...events, event];
  return event;
}

export function formatOfficeEventTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('cs-CZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Test helper — restores seed catalog. */
export function resetOfficeEventCatalogForTests(): void {
  events = SEED_EVENTS.map((event) => ({ ...event }));
  eventSeq = 700;
}
