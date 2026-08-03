/**
 * OF-01 / OF-02 / OF-10 / OF-11 — Office Event Catalog (persisted timeline source).
 * Not a platform Event Engine — local catalog for Office dashboard / Partner Timeline.
 */

import { loadJson, removeJson, saveJson } from './officeLocalStore';
import { OFFICE_STORAGE_KEYS } from './officeStorageKeys';

export type OfficeEventKind =
  | 'partner.created'
  | 'partner.updated'
  | 'offer.prepared'
  | 'offer.created'
  | 'package.selected'
  | 'offer.sent'
  | 'offer.viewed'
  | 'offer.accepted'
  | 'order.confirmed'
  | 'payment.waiting'
  | 'documents.prepared'
  | 'documents.sent'
  | 'clickwrap.confirmed'
  | 'proforma.issued'
  | 'payment.received'
  | 'builder.workspace.created'
  | 'builder.ready'
  | 'builder.opened'
  | 'pilot.ready'
  | 'pilot.prepared'
  | 'pilot.delivered'
  | 'followup.invite_opened'
  | 'followup.nda_accepted'
  | 'followup.account_activated'
  | 'followup.first_login'
  | 'followup.ready_for_contact'
  | 'partner.activated'
  | 'pilot.completed'
  | 'environment.activated'
  | 'partner.suspended'
  | 'partner.restored'
  | 'partner.archived'
  | 'admin.package_changed'
  | 'admin.licence_changed'
  | 'admin.contact_changed'
  | 'admin.note_added';

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
    detail: 'Domy s energií · referenční partner',
    occurredAt: '2026-08-01T08:00:00.000Z',
    partnerId: 'p-dse',
  },
  {
    id: 'evt-002',
    kind: 'offer.sent',
    label: 'Nabídka odeslána',
    detail: 'Pilotní nasazení · Reference House · 1 dům',
    occurredAt: '2026-08-01T10:30:00.000Z',
    partnerId: 'p-dse',
  },
  {
    id: 'evt-003',
    kind: 'order.confirmed',
    label: 'Objednávka potvrzena',
    detail: 'Domy s energií · potvrzení pilotu',
    occurredAt: '2026-08-02T09:15:00.000Z',
    partnerId: 'p-dse',
  },
  {
    id: 'evt-004',
    kind: 'payment.received',
    label: 'Platba přijata',
    detail: 'Pilotní poplatek · uhrazeno',
    occurredAt: '2026-08-02T14:00:00.000Z',
    partnerId: 'p-dse',
  },
  {
    id: 'evt-005',
    kind: 'builder.opened',
    label: 'Builder otevřen',
    detail: 'Reference House · dům P1',
    occurredAt: '2026-08-03T07:05:00.000Z',
    partnerId: 'p-dse',
  },
  {
    id: 'evt-006',
    kind: 'pilot.ready',
    label: 'Partner Environment připraven',
    detail: 'Domy s energií · Reference House · Client/Manager/Sales',
    occurredAt: '2026-08-03T12:00:00.000Z',
    partnerId: 'p-dse',
  },
]);

type EventPersistState = {
  readonly events: readonly OfficeEvent[];
  readonly eventSeq: number;
};

function seedEventState(): EventPersistState {
  return {
    events: SEED_EVENTS.map((event) => ({ ...event })),
    eventSeq: 700,
  };
}

function readEventState(): EventPersistState {
  const stored = loadJson<EventPersistState | null>(
    OFFICE_STORAGE_KEYS.events,
    null,
  );
  if (
    stored !== null &&
    Array.isArray(stored.events) &&
    stored.events.length > 0
  ) {
    return {
      events: stored.events.map((event) => ({ ...event })),
      eventSeq: typeof stored.eventSeq === 'number' ? stored.eventSeq : 700,
    };
  }
  return seedEventState();
}

const initialEvents = readEventState();
let events: OfficeEvent[] = initialEvents.events.map((event) => ({ ...event }));
let eventSeq = initialEvents.eventSeq;

export const OFFICE_EVENT_CATALOG: readonly OfficeEvent[] = SEED_EVENTS;

function persistEvents(): void {
  saveJson(OFFICE_STORAGE_KEYS.events, {
    events,
    eventSeq,
  } satisfies EventPersistState);
}

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
  persistEvents();
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
  removeJson(OFFICE_STORAGE_KEYS.events);
  const seeded = seedEventState();
  events = seeded.events.map((event) => ({ ...event }));
  eventSeq = seeded.eventSeq;
}
