/**
 * CAP-OP-09 — Message ingestion into Conversation Runtime store.
 * Deduplicates by Message-ID across Inbox/Sent.
 */

import type {
  PilotConversationMessage,
  PilotMailboxId,
  PilotMessageDirection,
  PilotMessageOrigin,
} from '../office/pilotConversationModel';
import type { PilotWorkspaceCaseId } from '../office/pilotWorkspaceModel';
import { mapToConversation } from './conversationMapping';
import type { ConversationMailStore } from './conversationMailStore';
import {
  getConversationMailStore,
  ingestStoreMessage,
  storeHasMessageId,
} from './conversationMailStore';
import type { ImapFetchedEnvelope } from './imapAdapter';
import type { SmtpSendMailResult } from './smtpAdapter';
import { allocateSystemMessageId } from './smtpAdapter';

export type IngestableEnvelope = {
  readonly mailboxId: PilotMailboxId;
  readonly messageId: string;
  readonly threadId: string;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly createdAt: string;
  readonly direction: PilotMessageDirection;
  readonly origin: PilotMessageOrigin;
  readonly caseId?: PilotWorkspaceCaseId | null;
};

export type MessageIngestionReport = {
  readonly added: number;
  readonly duplicates: number;
  readonly messages: readonly PilotConversationMessage[];
};

function directionFromFolder(
  folder: ImapFetchedEnvelope['folder'],
): PilotMessageDirection {
  return folder === 'Sent' ? 'outgoing' : 'incoming';
}

export function envelopeFromImap(
  mailboxId: PilotMailboxId,
  fetched: ImapFetchedEnvelope,
): IngestableEnvelope {
  return {
    mailboxId,
    messageId: fetched.messageId,
    threadId: fetched.threadId,
    fromEmail: fetched.fromEmail,
    toEmail: fetched.toEmail,
    subject: fetched.subject,
    body: fetched.body,
    createdAt: fetched.createdAt,
    direction: directionFromFolder(fetched.folder),
    origin: 'IMAP',
  };
}

export function ingestEnvelope(
  envelope: IngestableEnvelope,
  store: ConversationMailStore = getConversationMailStore(),
): { readonly result: 'added' | 'duplicate'; readonly message: PilotConversationMessage | null } {
  if (storeHasMessageId(envelope.messageId, store)) {
    return { result: 'duplicate', message: null };
  }

  const conversation = mapToConversation(
    {
      mailboxId: envelope.mailboxId,
      fromEmail: envelope.fromEmail,
      toEmail: envelope.toEmail,
      subject: envelope.subject,
      threadId: envelope.threadId,
      createdAt: envelope.createdAt,
      caseId: envelope.caseId,
    },
    store,
  );

  const message: PilotConversationMessage = {
    id: `cmsg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    direction: envelope.direction,
    subject: envelope.subject,
    body: envelope.body,
    messageId: envelope.messageId,
    threadId: envelope.threadId,
    mailboxId: envelope.mailboxId,
    conversationId: conversation.id,
    origin: envelope.origin,
    fromEmail: envelope.fromEmail,
    toEmail: envelope.toEmail,
    createdAt: envelope.createdAt,
  };

  const result = ingestStoreMessage(message, store);
  return {
    result,
    message: result === 'added' ? message : null,
  };
}

export function ingestImapFetch(
  mailboxId: PilotMailboxId,
  fetched: readonly ImapFetchedEnvelope[],
  store: ConversationMailStore = getConversationMailStore(),
): MessageIngestionReport {
  let added = 0;
  let duplicates = 0;
  const messages: PilotConversationMessage[] = [];

  for (const item of fetched) {
    const { result, message } = ingestEnvelope(
      envelopeFromImap(mailboxId, item),
      store,
    );
    if (result === 'duplicate') {
      duplicates += 1;
    } else if (message) {
      added += 1;
      messages.push(message);
    }
  }

  return { added, duplicates, messages };
}

export type SystemMailIngestInput = {
  readonly mailboxId: PilotMailboxId;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly subject: string;
  readonly body: string;
  readonly threadId?: string;
  readonly caseId?: PilotWorkspaceCaseId | null;
  readonly origin?: 'SYSTEM' | 'OFFICE';
  readonly sendResult: SmtpSendMailResult;
};

export function ingestOutboundSystemMail(
  input: SystemMailIngestInput,
  store: ConversationMailStore = getConversationMailStore(),
): { readonly result: 'added' | 'duplicate'; readonly message: PilotConversationMessage | null } {
  const messageId =
    input.sendResult.messageId.trim().length > 0
      ? input.sendResult.messageId
      : allocateSystemMessageId();
  const createdAt = new Date().toISOString();
  const threadId = input.threadId ?? messageId;

  return ingestEnvelope(
    {
      mailboxId: input.mailboxId,
      messageId,
      threadId,
      fromEmail: input.fromEmail,
      toEmail: input.toEmail,
      subject: input.subject,
      body: input.body,
      createdAt,
      direction: 'outgoing',
      origin: input.origin ?? 'SYSTEM',
      caseId: input.caseId,
    },
    store,
  );
}
