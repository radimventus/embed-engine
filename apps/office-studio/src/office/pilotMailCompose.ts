/**
 * PT-14 — Mail Compose domain helpers (pure).
 * Builds OFFICE drafts bound to active commercial case.
 * No SMTP · no React · future-ready for templates / signatures / attachments.
 */

import type {
  PilotConversation,
  PilotConversationMessage,
  PilotMailbox,
  PilotMailboxId,
} from './pilotConversationModel';
import type { PilotWorkspaceCase } from './pilotWorkspaceModel';
import type { SystemMailDraft } from '../mail/mailTransportService';

export type MailComposeMode = 'compose' | 'reply' | 'reply-all' | 'forward';

export type MailComposeDraft = {
  readonly mode: MailComposeMode;
  readonly mailboxId: PilotMailboxId;
  readonly caseId: string;
  readonly toEmail: string;
  readonly ccEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly threadId: string | null;
  readonly inReplyTo: string | null;
  readonly references: string | null;
  readonly conversationId: string | null;
  readonly partnerName: string;
  readonly origin: 'OFFICE';
};

export const MAIL_COMPOSE_MODE_LABELS: Readonly<
  Record<MailComposeMode, string>
> = Object.freeze({
  compose: 'Nový e-mail',
  reply: 'Odpověď',
  'reply-all': 'Odpověď všem',
  forward: 'Přeposlání',
});

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function ensureSubjectPrefix(subject: string, prefix: 'Re:' | 'Fwd:'): string {
  const trimmed = subject.trim();
  if (trimmed.length === 0) return `${prefix} `;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith(prefix.toLowerCase())) return trimmed;
  return `${prefix} ${trimmed}`;
}

function primaryContactEmail(activeCase: PilotWorkspaceCase): string {
  return activeCase.contacts[0]?.email ?? '';
}

function replyRecipient(
  source: PilotConversationMessage,
  mailbox: PilotMailbox,
): string {
  if (source.direction === 'incoming') return source.fromEmail;
  if (normalizeEmail(source.toEmail) !== normalizeEmail(mailbox.email)) {
    return source.toEmail;
  }
  return source.fromEmail;
}

function replyAllRecipients(
  source: PilotConversationMessage,
  conversation: PilotConversation | null,
  mailbox: PilotMailbox,
): { readonly toEmail: string; readonly ccEmail: string } {
  const mailboxEmail = normalizeEmail(mailbox.email);
  const primary = replyRecipient(source, mailbox);
  const participants = new Set<string>();

  for (const email of conversation?.participantEmails ?? []) {
    const normalized = normalizeEmail(email);
    if (normalized.length === 0 || normalized === mailboxEmail) continue;
    participants.add(email.trim());
  }

  participants.add(primary.trim());
  participants.delete(mailbox.email);

  const list = [...participants].filter((email) => email.length > 0);
  const toEmail = list[0] ?? primary;
  const ccEmail = list
    .slice(1)
    .filter((email) => normalizeEmail(email) !== normalizeEmail(toEmail))
    .join(', ');

  return { toEmail, ccEmail };
}

function buildReplyHeaders(source: PilotConversationMessage): {
  readonly threadId: string;
  readonly inReplyTo: string;
  readonly references: string;
} {
  const references = [source.threadId, source.messageId]
    .filter((value, index, all) => value.length > 0 && all.indexOf(value) === index)
    .join(' ');
  return {
    threadId: source.threadId.length > 0 ? source.threadId : source.messageId,
    inReplyTo: source.messageId,
    references,
  };
}

function quoteOriginal(source: PilotConversationMessage): string {
  const when = new Date(source.createdAt).toLocaleString('cs-CZ');
  return `\n\n---------- Původní zpráva ----------\nOd: ${source.fromEmail}\nDatum: ${when}\nPředmět: ${source.subject}\n\n${source.body}`;
}

export function buildNewComposeDraft(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly mailbox: PilotMailbox;
  readonly conversation?: PilotConversation | null;
}): MailComposeDraft {
  const conversation = input.conversation ?? null;
  return {
    mode: 'compose',
    mailboxId: input.mailbox.id,
    caseId: input.activeCase.id,
    toEmail: primaryContactEmail(input.activeCase),
    ccEmail: '',
    subject: conversation?.subject ?? '',
    body: '',
    threadId: null,
    inReplyTo: null,
    references: null,
    conversationId: conversation?.id ?? null,
    partnerName: input.activeCase.partnerName,
    origin: 'OFFICE',
  };
}

export function buildReplyDraft(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly mailbox: PilotMailbox;
  readonly source: PilotConversationMessage;
  readonly conversation: PilotConversation | null;
}): MailComposeDraft {
  const headers = buildReplyHeaders(input.source);
  return {
    mode: 'reply',
    mailboxId: input.mailbox.id,
    caseId: input.activeCase.id,
    toEmail: replyRecipient(input.source, input.mailbox),
    ccEmail: '',
    subject: ensureSubjectPrefix(input.source.subject, 'Re:'),
    body: '',
    threadId: headers.threadId,
    inReplyTo: headers.inReplyTo,
    references: headers.references,
    conversationId: input.conversation?.id ?? input.source.conversationId,
    partnerName: input.activeCase.partnerName,
    origin: 'OFFICE',
  };
}

export function buildReplyAllDraft(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly mailbox: PilotMailbox;
  readonly source: PilotConversationMessage;
  readonly conversation: PilotConversation | null;
}): MailComposeDraft {
  const headers = buildReplyHeaders(input.source);
  const recipients = replyAllRecipients(
    input.source,
    input.conversation,
    input.mailbox,
  );
  return {
    mode: 'reply-all',
    mailboxId: input.mailbox.id,
    caseId: input.activeCase.id,
    toEmail: recipients.toEmail,
    ccEmail: recipients.ccEmail,
    subject: ensureSubjectPrefix(input.source.subject, 'Re:'),
    body: '',
    threadId: headers.threadId,
    inReplyTo: headers.inReplyTo,
    references: headers.references,
    conversationId: input.conversation?.id ?? input.source.conversationId,
    partnerName: input.activeCase.partnerName,
    origin: 'OFFICE',
  };
}

export function buildForwardDraft(input: {
  readonly activeCase: PilotWorkspaceCase;
  readonly mailbox: PilotMailbox;
  readonly source: PilotConversationMessage;
  readonly conversation: PilotConversation | null;
}): MailComposeDraft {
  return {
    mode: 'forward',
    mailboxId: input.mailbox.id,
    caseId: input.activeCase.id,
    toEmail: primaryContactEmail(input.activeCase),
    ccEmail: '',
    subject: ensureSubjectPrefix(input.source.subject, 'Fwd:'),
    body: quoteOriginal(input.source),
    threadId: input.source.threadId,
    inReplyTo: null,
    references: null,
    conversationId: input.conversation?.id ?? input.source.conversationId,
    partnerName: input.activeCase.partnerName,
    origin: 'OFFICE',
  };
}

/** Convert compose draft → shared Mail Session SystemMailDraft. */
export function toSystemMailDraft(draft: MailComposeDraft): SystemMailDraft {
  const toEmail =
    draft.ccEmail.trim().length > 0
      ? `${draft.toEmail}, ${draft.ccEmail}`
      : draft.toEmail;

  return {
    mailboxId: draft.mailboxId,
    toEmail,
    subject: draft.subject,
    body: draft.body,
    threadId: draft.threadId ?? undefined,
    caseId: draft.caseId,
    origin: 'OFFICE',
    inReplyTo: draft.inReplyTo ?? undefined,
    references: draft.references ?? undefined,
  };
}

export function canSendComposeDraft(draft: MailComposeDraft): boolean {
  return (
    draft.caseId.trim().length > 0 &&
    draft.toEmail.trim().length > 0 &&
    draft.subject.trim().length > 0 &&
    draft.body.trim().length > 0
  );
}
