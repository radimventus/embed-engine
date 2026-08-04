/**
 * CAP-OP-04 / PT-07 — Mock Event Store for Pilot Timeline (session memory).
 * No browser storage · no Office Event Catalog persistence coupling.
 */

import type { PilotEventCatalog } from './pilotEventCatalog';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import type {
  PilotTimelineEvent,
  PilotTimelineEventId,
} from './pilotTimelineModel';

const MOCK_EVENTS: PilotTimelineEvent[] = [
  // case-dse-starter
  {
    id: 'tl-dse-offer-sent',
    caseId: 'case-dse-starter',
    kind: 'offer.sent',
    title: 'Offer Sent',
    summary: 'Odeslána nabídka Starter · Domy s energií',
    detail:
      'Partnerovi byla odeslána personalizovaná nabídka balíčku Starter včetně trial období 90 dní.',
    occurredAt: '2026-08-01T09:10:00.000Z',
  },
  {
    id: 'tl-dse-offer-viewed',
    caseId: 'case-dse-starter',
    kind: 'offer.viewed',
    title: 'Offer Viewed',
    summary: 'Partner otevřel veřejnou Offer Experience',
    detail:
      'Zobrazení nabídky /offer/domy-s-energi · balíček Starter označen jako doporučený.',
    occurredAt: '2026-08-01T14:22:00.000Z',
  },
  {
    id: 'tl-dse-email-in',
    caseId: 'case-dse-starter',
    kind: 'email.received',
    title: 'Email Received',
    summary: 'Jana Energetická · Dotaz k dokumentům',
    detail:
      'Příchozí zpráva: „Kdy dorazí smluvní balíček k podpisu?“ · Inbox Runtime.',
    occurredAt: '2026-08-02T08:40:00.000Z',
  },
  {
    id: 'tl-dse-email-out',
    caseId: 'case-dse-starter',
    kind: 'email.sent',
    title: 'Email Sent',
    summary: 'Odeslána odpověď s termínem dokumentů',
    detail:
      'Odchozí zpráva partnerovi s odhadem termínu dokumentového balíčku (mock).',
    occurredAt: '2026-08-02T10:05:00.000Z',
  },
  {
    id: 'tl-dse-order',
    caseId: 'case-dse-starter',
    kind: 'order.confirmed',
    title: 'Order Confirmed',
    summary: 'Objednávka Starter potvrzena',
    detail:
      'Commercial Experience potvrdila objednávku · připravena proforma a QR platba.',
    occurredAt: '2026-08-03T11:00:00.000Z',
  },
  {
    id: 'tl-dse-note',
    caseId: 'case-dse-starter',
    kind: 'note.added',
    title: 'Note Added',
    summary: 'Interní poznámka: čeká se na úhradu',
    detail:
      'Obchodník poznamenal, že partner potvrdil platbu převodem do 14 dnů.',
    occurredAt: '2026-08-03T15:30:00.000Z',
  },
  {
    id: 'tl-dse-pay',
    caseId: 'case-dse-starter',
    kind: 'payment.received',
    title: 'Payment Received',
    summary: 'Úhrada Starter zaznamenána',
    detail:
      'PaymentReceived · částka odpovídá Starter · připraveno Pilot Ready / handoff.',
    occurredAt: '2026-08-04T09:45:00.000Z',
  },
  {
    id: 'tl-dse-builder',
    caseId: 'case-dse-starter',
    kind: 'builder.ready',
    title: 'Builder Ready',
    summary: 'Builder Ready signal připraven',
    detail:
      'Runtime rozhraní builder.ready / Office handoff — bez Builder Runtime UI.',
    occurredAt: '2026-08-04T10:20:00.000Z',
  },

  // case-nord-pilot
  {
    id: 'tl-nord-offer-sent',
    caseId: 'case-nord-pilot',
    kind: 'offer.sent',
    title: 'Offer Sent',
    summary: 'Odeslána nabídka Pilot · Nord Living',
    detail: 'Personalizovaná nabídka Pilot pro Nord Living a.s.',
    occurredAt: '2026-08-02T12:00:00.000Z',
  },
  {
    id: 'tl-nord-viewed',
    caseId: 'case-nord-pilot',
    kind: 'offer.viewed',
    title: 'Offer Viewed',
    summary: 'Offer Experience zobrazena partnerem',
    detail: 'Partner otevřel nabídku a prohlíží balíček Pilot.',
    occurredAt: '2026-08-02T16:40:00.000Z',
  },
  {
    id: 'tl-nord-email',
    caseId: 'case-nord-pilot',
    kind: 'email.received',
    title: 'Email Received',
    summary: 'Erik Nord · Dokončení objednávky Pilot',
    detail: 'Partner žádá upřesnění fakturačních údajů před potvrzením.',
    occurredAt: '2026-08-03T16:05:00.000Z',
  },
  {
    id: 'tl-nord-note',
    caseId: 'case-nord-pilot',
    kind: 'note.added',
    title: 'Note Added',
    summary: 'Poznámka: checkout rozpracován',
    detail: 'Obchodní případ je ve stavu Objednávka — čeká na dokončení formuláře.',
    occurredAt: '2026-08-03T17:10:00.000Z',
  },

  // case-atelier-studio
  {
    id: 'tl-atelier-offer',
    caseId: 'case-atelier-studio',
    kind: 'offer.sent',
    title: 'Offer Sent',
    summary: 'Odeslána nabídka Studio Partner',
    detail: 'Ateliér Domů · Studio Partner nabídka odeslána.',
    occurredAt: '2026-07-30T10:00:00.000Z',
  },
  {
    id: 'tl-atelier-email',
    caseId: 'case-atelier-studio',
    kind: 'email.received',
    title: 'Email Received',
    summary: 'Marie Ateliér · Úvodní představení',
    detail: 'Partner děkuje za nabídku (archivovaná konverzace).',
    occurredAt: '2026-08-01T09:00:00.000Z',
  },
];

let store: PilotTimelineEvent[] = MOCK_EVENTS.map((event) => ({ ...event }));

export function resetPilotTimelineStoreForTests(): void {
  store = MOCK_EVENTS.map((event) => ({ ...event }));
}

export function listMockTimelineEventsForCase(
  caseId: PilotWorkspaceCaseId,
): readonly PilotTimelineEvent[] {
  return store
    .filter((event) => event.caseId === caseId)
    .slice()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function getMockTimelineEventById(
  eventId: PilotTimelineEventId,
): PilotTimelineEvent | null {
  return store.find((event) => event.id === eventId) ?? null;
}

export function appendMockTimelineEvent(event: PilotTimelineEvent): void {
  store = [event, ...store.filter((item) => item.id !== event.id)];
}

/** Default mock Event Catalog adapter — replaceable in PT-08+. */
export const mockPilotEventCatalog: PilotEventCatalog = {
  listEventsForCase: ({ caseId }) => listMockTimelineEventsForCase(caseId),
  getEventById: (eventId) => getMockTimelineEventById(eventId),
  appendEvent: (event) => {
    appendMockTimelineEvent(event);
  },
};
