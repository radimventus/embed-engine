/**
 * CAP-OP-09 — In-memory Conversation mail store.
 * Transport writes here; Conversation Runtime reads here.
 * Session-only — no database persistence.
 */

import {
  PILOT_DEMO_CONVERSATION_MESSAGES,
  PILOT_DEMO_CONVERSATIONS,
  PILOT_DEMO_MAILBOXES,
  type PilotConversation,
  type PilotConversationId,
  type PilotConversationMessage,
  type PilotMailbox,
  type PilotMailboxId,
} from '../office/pilotConversationModel';
import type { PilotWorkspaceCaseId } from '../office/pilotWorkspaceModel';

export type ConversationMailStore = {
  mailboxes: PilotMailbox[];
  conversations: PilotConversation[];
  messages: PilotConversationMessage[];
  messageIds: Set<string>;
};

function normalizeMessageId(messageId: string): string {
  return messageId.trim().toLowerCase();
}

export function createConversationMailStore(
  seed: {
    readonly mailboxes?: readonly PilotMailbox[];
    readonly conversations?: readonly PilotConversation[];
    readonly messages?: readonly PilotConversationMessage[];
  } = {},
): ConversationMailStore {
  const mailboxes = [...(seed.mailboxes ?? PILOT_DEMO_MAILBOXES)];
  const conversations = [...(seed.conversations ?? PILOT_DEMO_CONVERSATIONS)];
  const messages = [...(seed.messages ?? PILOT_DEMO_CONVERSATION_MESSAGES)];
  const messageIds = new Set(messages.map((item) => normalizeMessageId(item.messageId)));
  return { mailboxes, conversations, messages, messageIds };
}

let activeStore: ConversationMailStore = createConversationMailStore();

export function getConversationMailStore(): ConversationMailStore {
  return activeStore;
}

export function resetConversationMailStore(
  seed?: Parameters<typeof createConversationMailStore>[0],
): ConversationMailStore {
  activeStore = createConversationMailStore(seed);
  return activeStore;
}

export function listStoreMailboxes(
  store: ConversationMailStore = activeStore,
): readonly PilotMailbox[] {
  return store.mailboxes;
}

export function getStoreMailbox(
  mailboxId: PilotMailboxId,
  store: ConversationMailStore = activeStore,
): PilotMailbox | null {
  return store.mailboxes.find((item) => item.id === mailboxId) ?? null;
}

export function listStoreConversations(
  store: ConversationMailStore = activeStore,
): readonly PilotConversation[] {
  return store.conversations;
}

export function getStoreConversation(
  conversationId: PilotConversationId,
  store: ConversationMailStore = activeStore,
): PilotConversation | null {
  return store.conversations.find((item) => item.id === conversationId) ?? null;
}

export function storeConversationsForCase(
  caseId: PilotWorkspaceCaseId | null,
  store: ConversationMailStore = activeStore,
): readonly PilotConversation[] {
  if (caseId === null) {
    return store.conversations.filter((item) => item.caseId === null);
  }
  return store.conversations.filter((item) => item.caseId === caseId);
}

export function storeMessagesForConversation(
  conversationId: PilotConversationId,
  store: ConversationMailStore = activeStore,
): readonly PilotConversationMessage[] {
  return store.messages
    .filter((item) => item.conversationId === conversationId)
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function storeHasMessageId(
  messageId: string,
  store: ConversationMailStore = activeStore,
): boolean {
  return store.messageIds.has(normalizeMessageId(messageId));
}

export type IngestMessageResult = 'added' | 'duplicate';

export function ingestStoreMessage(
  message: PilotConversationMessage,
  store: ConversationMailStore = activeStore,
): IngestMessageResult {
  const key = normalizeMessageId(message.messageId);
  if (store.messageIds.has(key)) {
    return 'duplicate';
  }
  store.messageIds.add(key);
  store.messages.push(message);
  return 'added';
}

export function upsertStoreConversation(
  conversation: PilotConversation,
  store: ConversationMailStore = activeStore,
): PilotConversation {
  const index = store.conversations.findIndex((item) => item.id === conversation.id);
  if (index >= 0) {
    store.conversations[index] = conversation;
    return conversation;
  }
  store.conversations.push(conversation);
  return conversation;
}

export function ensureStoreMailbox(
  mailbox: PilotMailbox,
  store: ConversationMailStore = activeStore,
): PilotMailbox {
  const existing = store.mailboxes.find((item) => item.id === mailbox.id);
  if (existing) return existing;
  store.mailboxes.push(mailbox);
  return mailbox;
}
