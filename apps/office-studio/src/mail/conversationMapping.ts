/**
 * CAP-OP-09 — Conversation mapping rules (email + commercial case).
 * Unmatched traffic lands in Nepřiřazené (caseId null).
 */

import type {
  PilotConversation,
  PilotConversationId,
  PilotMailboxId,
} from '../office/pilotConversationModel';
import type { PilotWorkspaceCaseId } from '../office/pilotWorkspaceModel';
import type { ConversationMailStore } from './conversationMailStore';
import { upsertStoreConversation } from './conversationMailStore';

export type ConversationMappingInput = {
  readonly mailboxId: PilotMailboxId;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly threadId: string;
  readonly createdAt: string;
  /** Optional explicit case from caller (system mail). */
  readonly caseId?: PilotWorkspaceCaseId | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function participantMatch(
  conversation: PilotConversation,
  emails: readonly string[],
): boolean {
  const participants = conversation.participantEmails.map(normalizeEmail);
  return emails.some((email) => participants.includes(email));
}

function allocateConversationId(threadId: string): PilotConversationId {
  const slug = threadId.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 48);
  return `conv-map-${slug || Date.now().toString(36)}`;
}

/**
 * Resolve or create a Conversation for an envelope / outbound draft.
 */
export function mapToConversation(
  input: ConversationMappingInput,
  store: ConversationMailStore,
): PilotConversation {
  const allEmails = [input.fromEmail, input.toEmail].map(normalizeEmail);
  const externalEmails = allEmails.filter(
    (email) => !email.endsWith('@conis.cz'),
  );

  if (input.caseId) {
    const byCase = store.conversations.find(
      (item) =>
        item.caseId === input.caseId && item.mailboxId === input.mailboxId,
    );
    if (byCase) {
      const merged = {
        ...byCase,
        subject: byCase.subject || input.subject,
        updatedAt: input.createdAt,
        participantEmails: Array.from(
          new Set([
            ...byCase.participantEmails.map(normalizeEmail),
            ...allEmails,
          ]),
        ),
      };
      return upsertStoreConversation(merged, store);
    }
  }

  if (externalEmails.length > 0) {
    const byEmailSameMailbox = store.conversations.find(
      (item) =>
        item.mailboxId === input.mailboxId &&
        participantMatch(item, externalEmails),
    );
    const byEmail =
      byEmailSameMailbox ??
      store.conversations.find((item) =>
        participantMatch(item, externalEmails),
      );
    if (byEmail) {
      const merged = {
        ...byEmail,
        updatedAt: input.createdAt,
        subject: byEmail.subject || input.subject,
        participantEmails: Array.from(
          new Set([
            ...byEmail.participantEmails.map(normalizeEmail),
            ...allEmails,
          ]),
        ),
      };
      return upsertStoreConversation(merged, store);
    }
  }

  const unassigned: PilotConversation = {
    id: allocateConversationId(input.threadId),
    mailboxId: input.mailboxId,
    caseId: input.caseId ?? null,
    subject: input.subject || 'Nepřiřazené',
    participantEmails: allEmails,
    status: 'open',
    updatedAt: input.createdAt,
  };
  return upsertStoreConversation(unassigned, store);
}
