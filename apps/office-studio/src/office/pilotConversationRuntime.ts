/**
 * CAP-OP-08 / CAP-OP-09 — Conversation Runtime (in-memory session).
 * Reads from Conversation mail store so transport can ingest Messages.
 */

import {
  getStoreConversation,
  getStoreMailbox,
  listStoreMailboxes,
  storeConversationsForCase,
  storeMessagesForConversation,
} from '../mail/conversationMailStore';
import type {
  PilotConversation,
  PilotConversationId,
  PilotConversationMessage,
  PilotMailbox,
} from './pilotConversationModel';
import type { PilotMailTransportRegistry } from './pilotMailTransport';
import { emptyPilotMailTransportRegistry } from './pilotMailTransport';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotConversationRuntimeState = {
  readonly mailboxes: readonly PilotMailbox[];
  readonly conversations: readonly PilotConversation[];
  readonly activeConversationId: PilotConversationId | null;
  readonly activeConversation: PilotConversation | null;
  readonly messages: readonly PilotConversationMessage[];
  readonly activeMailbox: PilotMailbox | null;
};

export type PilotConversationRuntimeAction =
  | {
      readonly type: 'load-for-case';
      readonly caseId: PilotWorkspaceCaseId | null;
    }
  | {
      readonly type: 'select-conversation';
      readonly conversationId: PilotConversationId | null;
    }
  | {
      readonly type: 'refresh-from-store';
      readonly caseId?: PilotWorkspaceCaseId | null;
    }
  | { readonly type: 'reset-conversation-runtime' };

function resolveActive(
  conversations: readonly PilotConversation[],
  activeConversationId: PilotConversationId | null,
): {
  readonly activeConversationId: PilotConversationId | null;
  readonly activeConversation: PilotConversation | null;
  readonly messages: readonly PilotConversationMessage[];
  readonly activeMailbox: PilotMailbox | null;
} {
  const activeConversation =
    activeConversationId === null
      ? null
      : (conversations.find((item) => item.id === activeConversationId) ??
        getStoreConversation(activeConversationId));

  const resolvedId = activeConversation?.id ?? null;
  const messages =
    resolvedId === null ? [] : storeMessagesForConversation(resolvedId);
  const activeMailbox =
    activeConversation === null
      ? null
      : getStoreMailbox(activeConversation.mailboxId);

  return {
    activeConversationId: resolvedId,
    activeConversation,
    messages,
    activeMailbox,
  };
}

function conversationsForRuntimeCase(
  caseId: PilotWorkspaceCaseId | null,
): readonly PilotConversation[] {
  return storeConversationsForCase(caseId);
}

export function createInitialConversationRuntimeState(
  caseId: PilotWorkspaceCaseId | null = null,
): PilotConversationRuntimeState {
  const conversations = conversationsForRuntimeCase(caseId);
  const preferred =
    caseId === null
      ? (conversations[0] ?? null)
      : (conversations.find((item) => item.caseId === caseId) ??
        conversations[0] ??
        null);
  const active = resolveActive(conversations, preferred?.id ?? null);
  return {
    mailboxes: listStoreMailboxes(),
    conversations,
    ...active,
  };
}

export function reducePilotConversation(
  state: PilotConversationRuntimeState,
  action: PilotConversationRuntimeAction,
): PilotConversationRuntimeState {
  switch (action.type) {
    case 'load-for-case': {
      const conversations = conversationsForRuntimeCase(action.caseId);
      const preferred =
        action.caseId === null
          ? (conversations[0] ?? null)
          : (conversations.find((item) => item.caseId === action.caseId) ??
            conversations[0] ??
            null);
      return {
        mailboxes: listStoreMailboxes(),
        conversations,
        ...resolveActive(conversations, preferred?.id ?? null),
      };
    }
    case 'select-conversation':
      return {
        ...state,
        mailboxes: listStoreMailboxes(),
        ...resolveActive(state.conversations, action.conversationId),
      };
    case 'refresh-from-store': {
      const caseId =
        action.caseId !== undefined
          ? action.caseId
          : (state.activeConversation?.caseId ??
            state.conversations.find((item) => item.caseId !== null)?.caseId ??
            null);
      const conversations = conversationsForRuntimeCase(caseId);
      const activeId =
        state.activeConversationId !== null &&
        conversations.some((item) => item.id === state.activeConversationId)
          ? state.activeConversationId
          : (conversations[0]?.id ?? null);
      return {
        mailboxes: listStoreMailboxes(),
        conversations,
        ...resolveActive(conversations, activeId),
      };
    }
    case 'reset-conversation-runtime':
      return createInitialConversationRuntimeState(null);
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Optional hook point for transport registry.
 * Keeps adapters injectable without coupling Runtime to IMAP/SMTP.
 */
export function withMailTransportRegistry(
  _registry: PilotMailTransportRegistry = emptyPilotMailTransportRegistry,
): PilotMailTransportRegistry {
  return _registry;
}
