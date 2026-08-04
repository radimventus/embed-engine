/**
 * CAP-OP-03 / CAP-OP-10 — Inbox projection DTO (UI shape over Conversation).
 * No IMAP / SMTP / persistence / AI. Messages originate in Conversation store.
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotInboxCategoryId =
  | 'new'
  | 'waiting_reply'
  | 'unassigned'
  | 'archive';

export type PilotInboxMessageStatus =
  | 'unread'
  | 'read'
  | 'waiting'
  | 'archived';

export type PilotInboxMessageId = string;

export type PilotInboxMessage = {
  readonly id: PilotInboxMessageId;
  readonly senderName: string;
  readonly senderEmail: string;
  readonly subject: string;
  readonly preview: string;
  readonly receivedAt: string;
  readonly status: PilotInboxMessageStatus;
  readonly category: PilotInboxCategoryId;
  readonly caseId: PilotWorkspaceCaseId | null;
};

export type PilotInboxCategory = {
  readonly id: PilotInboxCategoryId;
  readonly label: string;
};

export const PILOT_INBOX_CATEGORIES: readonly PilotInboxCategory[] =
  Object.freeze([
    { id: 'new', label: 'Nové' },
    { id: 'waiting_reply', label: 'Čeká na odpověď' },
    { id: 'unassigned', label: 'Nepřiřazené' },
    { id: 'archive', label: 'Archiv' },
  ]);

export const PILOT_INBOX_MESSAGE_STATUS_LABELS: Readonly<
  Record<PilotInboxMessageStatus, string>
> = Object.freeze({
  unread: 'Nepřečteno',
  read: 'Přečteno',
  waiting: 'Čeká',
  archived: 'Archiv',
});

/** @deprecated CAP-OP-10 — Inbox projects Conversation store; demo list unused. */
export const PILOT_INBOX_DEMO_MESSAGES: readonly PilotInboxMessage[] =
  Object.freeze([
    {
      id: 'msg-dse-payment',
      senderName: 'Jana Energetická',
      senderEmail: 'jana@domysenergii.cz',
      subject: 'Potvrzení úhrady Starter',
      preview: 'Posílám potvrzení platby pro balíček Starter…',
      receivedAt: '2026-08-04T10:15:00.000Z',
      status: 'unread',
      category: 'new',
      caseId: 'case-dse-starter',
    },
    {
      id: 'msg-dse-docs',
      senderName: 'Jana Energetická',
      senderEmail: 'jana@domysenergii.cz',
      subject: 'Dotaz k dokumentům',
      preview: 'Kdy dorazí smluvní balíček k podpisu?',
      receivedAt: '2026-08-04T08:40:00.000Z',
      status: 'waiting',
      category: 'waiting_reply',
      caseId: 'case-dse-starter',
    },
    {
      id: 'msg-nord-checkout',
      senderName: 'Erik Nord',
      senderEmail: 'erik@nordliving.cz',
      subject: 'Dokončení objednávky Pilot',
      preview: 'Potřebujeme upřesnit fakturační údaje…',
      receivedAt: '2026-08-03T16:05:00.000Z',
      status: 'unread',
      category: 'new',
      caseId: 'case-nord-pilot',
    },
    {
      id: 'msg-unknown-lead',
      senderName: 'Petra Hostinská',
      senderEmail: 'petra@example.cz',
      subject: 'Zájem o CONIS pilot',
      preview: 'Viděli jsme nabídku a chtěli bychom pokračovat…',
      receivedAt: '2026-08-03T11:20:00.000Z',
      status: 'unread',
      category: 'unassigned',
      caseId: null,
    },
    {
      id: 'msg-atelier-archive',
      senderName: 'Marie Ateliér',
      senderEmail: 'marie@atelierdomu.cz',
      subject: 'Úvodní představení Studio Partner',
      preview: 'Děkujeme za zaslanou nabídku…',
      receivedAt: '2026-08-01T09:00:00.000Z',
      status: 'archived',
      category: 'archive',
      caseId: 'case-atelier-studio',
    },
  ]);

export function formatInboxReceivedAt(iso: string): string {
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function messagesInCategory(
  messages: readonly PilotInboxMessage[],
  categoryId: PilotInboxCategoryId,
): readonly PilotInboxMessage[] {
  return messages
    .filter((message) => message.category === categoryId)
    .slice()
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function getInboxMessage(
  messages: readonly PilotInboxMessage[],
  messageId: PilotInboxMessageId | null,
): PilotInboxMessage | null {
  if (messageId === null) return null;
  return messages.find((message) => message.id === messageId) ?? null;
}
