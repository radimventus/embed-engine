/**
 * CAP-OP-08 — Conversation Runtime foundation (canonical communication model).
 * Transport-agnostic: no IMAP / SMTP / persistence.
 * Seed data only — live Messages live in the Conversation mail store (CAP-OP-09).
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotMailboxId = string;
export type PilotConversationId = string;
export type PilotConversationMessageId = string;

export type PilotMailboxStatus = 'active' | 'paused' | 'disabled';

export type PilotMailbox = {
  readonly id: PilotMailboxId;
  readonly name: string;
  readonly email: string;
  readonly owner: string;
  readonly status: PilotMailboxStatus;
};

export type PilotConversationStatus = 'open' | 'waiting' | 'closed';

/** Whole communication thread bound to a commercial case (optional). */
export type PilotConversation = {
  readonly id: PilotConversationId;
  readonly mailboxId: PilotMailboxId;
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly subject: string;
  readonly participantEmails: readonly string[];
  readonly status: PilotConversationStatus;
  readonly updatedAt: string;
};

export type PilotMessageDirection = 'incoming' | 'outgoing';

export type PilotMessageOrigin = 'SYSTEM' | 'OFFICE' | 'IMAP';

export type PilotConversationMessage = {
  readonly id: PilotConversationMessageId;
  readonly direction: PilotMessageDirection;
  readonly subject: string;
  readonly body: string;
  /** RFC Message-ID style identifier (transport-ready). */
  readonly messageId: string;
  readonly threadId: string;
  readonly mailboxId: PilotMailboxId;
  readonly conversationId: PilotConversationId;
  readonly origin: PilotMessageOrigin;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly createdAt: string;
  /** PT-15 — commercial document attachments (PDF). */
  readonly attachments?: readonly PilotMessageAttachment[];
};

export type PilotMessageAttachment = {
  readonly documentId: string;
  readonly fileName: string;
  readonly mimeType: 'application/pdf';
  readonly bytesBase64: string;
  readonly byteLength: number;
};

export const PILOT_MAILBOX_STATUS_LABELS: Readonly<
  Record<PilotMailboxStatus, string>
> = Object.freeze({
  active: 'Aktivní',
  paused: 'Pozastaveno',
  disabled: 'Vypnuto',
});

export const PILOT_MESSAGE_DIRECTION_LABELS: Readonly<
  Record<PilotMessageDirection, string>
> = Object.freeze({
  incoming: 'Příchozí',
  outgoing: 'Odchozí',
});

export const PILOT_MESSAGE_ORIGIN_LABELS: Readonly<
  Record<PilotMessageOrigin, string>
> = Object.freeze({
  SYSTEM: 'SYSTEM',
  OFFICE: 'OFFICE',
  IMAP: 'IMAP',
});

export const PILOT_DEMO_MAILBOXES: readonly PilotMailbox[] = Object.freeze([
  {
    id: 'mbx-conis-contact',
    name: 'CONIS Kontakt',
    email: 'kontakt@conis.cz',
    owner: 'office-ops',
    status: 'active',
  },
  {
    id: 'mbx-conis-sales',
    name: 'CONIS Sales',
    email: 'sales@conis.cz',
    owner: 'office-sales',
    status: 'active',
  },
  {
    id: 'mbx-conis-ops',
    name: 'CONIS Operations',
    email: 'ops@conis.cz',
    owner: 'office-ops',
    status: 'active',
  },
]);

export const PILOT_DEMO_CONVERSATIONS: readonly PilotConversation[] =
  Object.freeze([
    {
      id: 'conv-dse-starter',
      mailboxId: 'mbx-conis-sales',
      caseId: 'case-dse-starter',
      subject: 'Domy s energií · Starter',
      participantEmails: ['jana@domysenergii.cz', 'sales@conis.cz'],
      status: 'waiting',
      updatedAt: '2026-08-04T10:15:00.000Z',
    },
    {
      id: 'conv-nord-pilot',
      mailboxId: 'mbx-conis-sales',
      caseId: 'case-nord-pilot',
      subject: 'Nord Living · Pilot',
      participantEmails: ['erik@nordliving.cz', 'sales@conis.cz'],
      status: 'open',
      updatedAt: '2026-08-03T16:05:00.000Z',
    },
    {
      id: 'conv-atelier-studio',
      mailboxId: 'mbx-conis-sales',
      caseId: 'case-atelier-studio',
      subject: 'Ateliér Domů · Studio Partner',
      participantEmails: ['marie@atelierdomu.cz', 'sales@conis.cz'],
      status: 'closed',
      updatedAt: '2026-08-01T09:00:00.000Z',
    },
    {
      id: 'conv-unassigned-lead',
      mailboxId: 'mbx-conis-sales',
      caseId: null,
      subject: 'Zájem o CONIS pilot',
      participantEmails: ['petra@example.cz', 'sales@conis.cz'],
      status: 'open',
      updatedAt: '2026-08-03T11:20:00.000Z',
    },
  ]);

export const PILOT_DEMO_CONVERSATION_MESSAGES: readonly PilotConversationMessage[] =
  Object.freeze([
    {
      id: 'cmsg-dse-offer',
      direction: 'outgoing',
      subject: 'Nabídka CONIS Starter',
      body: 'Dobrý den, zasíláme personalizovanou nabídku balíčku Starter.',
      messageId: '<offer-dse-001@conis.cz>',
      threadId: 'thread-dse-starter',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-dse-starter',
      origin: 'SYSTEM',
      fromEmail: 'sales@conis.cz',
      toEmail: 'jana@domysenergii.cz',
      createdAt: '2026-08-01T09:10:00.000Z',
    },
    {
      id: 'cmsg-dse-docs',
      direction: 'incoming',
      subject: 'Dotaz k dokumentům',
      body: 'Kdy dorazí smluvní balíček k podpisu?',
      messageId: '<docs-dse-002@domysenergii.cz>',
      threadId: 'thread-dse-starter',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-dse-starter',
      origin: 'IMAP',
      fromEmail: 'jana@domysenergii.cz',
      toEmail: 'sales@conis.cz',
      createdAt: '2026-08-02T08:40:00.000Z',
    },
    {
      id: 'cmsg-dse-reply',
      direction: 'outgoing',
      subject: 'Re: Dotaz k dokumentům',
      body: 'Dokumenty připravíme do konce týdne. Děkujeme za trpělivost.',
      messageId: '<docs-reply-dse-003@conis.cz>',
      threadId: 'thread-dse-starter',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-dse-starter',
      origin: 'OFFICE',
      fromEmail: 'sales@conis.cz',
      toEmail: 'jana@domysenergii.cz',
      createdAt: '2026-08-02T10:05:00.000Z',
    },
    {
      id: 'cmsg-dse-pay',
      direction: 'incoming',
      subject: 'Potvrzení úhrady Starter',
      body: 'Posílám potvrzení platby pro balíček Starter.',
      messageId: '<pay-dse-004@domysenergii.cz>',
      threadId: 'thread-dse-starter',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-dse-starter',
      origin: 'IMAP',
      fromEmail: 'jana@domysenergii.cz',
      toEmail: 'sales@conis.cz',
      createdAt: '2026-08-04T10:15:00.000Z',
    },
    {
      id: 'cmsg-nord-in',
      direction: 'incoming',
      subject: 'Dokončení objednávky Pilot',
      body: 'Potřebujeme upřesnit fakturační údaje před potvrzením.',
      messageId: '<nord-001@nordliving.cz>',
      threadId: 'thread-nord-pilot',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-nord-pilot',
      origin: 'IMAP',
      fromEmail: 'erik@nordliving.cz',
      toEmail: 'sales@conis.cz',
      createdAt: '2026-08-03T16:05:00.000Z',
    },
    {
      id: 'cmsg-atelier-welcome',
      direction: 'outgoing',
      subject: 'Úvodní představení Studio Partner',
      body: 'Děkujeme za zájem o Studio Partner. Níže je odkaz na nabídku.',
      messageId: '<welcome-atelier-001@conis.cz>',
      threadId: 'thread-atelier-studio',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-atelier-studio',
      origin: 'SYSTEM',
      fromEmail: 'sales@conis.cz',
      toEmail: 'marie@atelierdomu.cz',
      createdAt: '2026-07-30T10:00:00.000Z',
    },
    {
      id: 'cmsg-lead-in',
      direction: 'incoming',
      subject: 'Zájem o CONIS pilot',
      body: 'Viděli jsme nabídku a chtěli bychom pokračovat.',
      messageId: '<lead-001@example.cz>',
      threadId: 'thread-unassigned-lead',
      mailboxId: 'mbx-conis-sales',
      conversationId: 'conv-unassigned-lead',
      origin: 'IMAP',
      fromEmail: 'petra@example.cz',
      toEmail: 'sales@conis.cz',
      createdAt: '2026-08-03T11:20:00.000Z',
    },
  ]);

export function getPilotMailbox(
  mailboxId: PilotMailboxId,
): PilotMailbox | null {
  return PILOT_DEMO_MAILBOXES.find((item) => item.id === mailboxId) ?? null;
}

export function getPilotConversation(
  conversationId: PilotConversationId,
): PilotConversation | null {
  return (
    PILOT_DEMO_CONVERSATIONS.find((item) => item.id === conversationId) ?? null
  );
}

export function conversationsForCase(
  caseId: PilotWorkspaceCaseId | null,
): readonly PilotConversation[] {
  if (caseId === null) {
    return PILOT_DEMO_CONVERSATIONS.filter((item) => item.caseId === null);
  }
  return PILOT_DEMO_CONVERSATIONS.filter((item) => item.caseId === caseId);
}

export function messagesForConversation(
  conversationId: PilotConversationId,
): readonly PilotConversationMessage[] {
  return PILOT_DEMO_CONVERSATION_MESSAGES.filter(
    (item) => item.conversationId === conversationId,
  )
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
