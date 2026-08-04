/**
 * CAP-OP-10 — Inbox as projection of Conversation Runtime (no parallel Inbox store).
 */

import type {
  PilotConversation,
  PilotConversationMessage,
} from './pilotConversationModel';
import type {
  PilotInboxCategoryId,
  PilotInboxMessage,
  PilotInboxMessageId,
  PilotInboxMessageStatus,
} from './pilotInboxModel';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import type { ConversationMailStore } from '../mail/conversationMailStore';
import {
  getConversationMailStore,
  getStoreConversation,
  upsertStoreConversation,
} from '../mail/conversationMailStore';

function senderNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function categoryForMessage(
  message: PilotConversationMessage,
  conversation: PilotConversation | null,
): PilotInboxCategoryId {
  if (conversation?.caseId === null || conversation === null) {
    if (conversation?.status === 'closed') return 'archive';
    return 'unassigned';
  }
  if (conversation.status === 'closed') return 'archive';
  if (message.direction === 'outgoing') return 'waiting_reply';
  return 'new';
}

function statusForMessage(
  message: PilotConversationMessage,
  category: PilotInboxCategoryId,
  readIds: ReadonlySet<string>,
): PilotInboxMessageStatus {
  if (category === 'archive') return 'archived';
  if (category === 'waiting_reply') return 'waiting';
  if (readIds.has(message.id)) return 'read';
  return message.direction === 'incoming' ? 'unread' : 'read';
}

export function projectConversationMessageToInbox(
  message: PilotConversationMessage,
  conversation: PilotConversation | null,
  readIds: ReadonlySet<string> = new Set(),
): PilotInboxMessage {
  const category = categoryForMessage(message, conversation);
  return {
    id: message.id,
    senderName: senderNameFromEmail(message.fromEmail),
    senderEmail: message.fromEmail,
    subject: message.subject,
    preview: message.body.slice(0, 120),
    receivedAt: message.createdAt,
    status: statusForMessage(message, category, readIds),
    category,
    caseId: conversation?.caseId ?? null,
  };
}

export function projectInboxFromConversationStore(
  store: ConversationMailStore = getConversationMailStore(),
  readIds: ReadonlySet<string> = new Set(),
): readonly PilotInboxMessage[] {
  return store.messages
    .slice()
    .map((message) => {
      const conversation = getStoreConversation(message.conversationId, store);
      return projectConversationMessageToInbox(message, conversation, readIds);
    })
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function assignConversationCaseForMessage(
  messageId: PilotInboxMessageId,
  caseId: PilotWorkspaceCaseId,
  store: ConversationMailStore = getConversationMailStore(),
): PilotConversation | null {
  const message = store.messages.find((item) => item.id === messageId);
  if (message === undefined) return null;
  const conversation = getStoreConversation(message.conversationId, store);
  if (conversation === null) return null;
  return upsertStoreConversation(
    {
      ...conversation,
      caseId,
      status: conversation.status === 'closed' ? 'open' : conversation.status,
      updatedAt: new Date().toISOString(),
    },
    store,
  );
}

export function unassignConversationCaseForMessage(
  messageId: PilotInboxMessageId,
  store: ConversationMailStore = getConversationMailStore(),
): PilotConversation | null {
  const message = store.messages.find((item) => item.id === messageId);
  if (message === undefined) return null;
  const conversation = getStoreConversation(message.conversationId, store);
  if (conversation === null) return null;
  return upsertStoreConversation(
    {
      ...conversation,
      caseId: null,
      updatedAt: new Date().toISOString(),
    },
    store,
  );
}

export function conversationIdForInboxMessage(
  messageId: PilotInboxMessageId,
  store: ConversationMailStore = getConversationMailStore(),
): string | null {
  return store.messages.find((item) => item.id === messageId)?.conversationId ?? null;
}
