/**
 * CAP-OP-08 / PT-11 — Conversation Runtime (in-memory session).
 * Loads Conversation + Message list; tracks active Conversation.
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import {
  conversationsForCase,
  getPilotConversation,
  getPilotMailbox,
  messagesForConversation,
  PILOT_DEMO_CONVERSATIONS,
  PILOT_DEMO_MAILBOXES,
  type PilotConversation,
  type PilotConversationId,
  type PilotConversationMessage,
  type PilotMailbox,
} from './pilotConversationModel';
import type { PilotMailTransportRegistry } from './pilotMailTransport';
import { emptyPilotMailTransportRegistry } from './pilotMailTransport';

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
        getPilotConversation(activeConversationId));

  const resolvedId = activeConversation?.id ?? null;
  const messages =
    resolvedId === null ? [] : messagesForConversation(resolvedId);
  const activeMailbox =
    activeConversation === null
      ? null
      : getPilotMailbox(activeConversation.mailboxId);

  return {
    activeConversationId: resolvedId,
    activeConversation,
    messages,
    activeMailbox,
  };
}

export function createInitialConversationRuntimeState(
  caseId: PilotWorkspaceCaseId | null = null,
): PilotConversationRuntimeState {
  const conversations =
    caseId === null
      ? PILOT_DEMO_CONVERSATIONS
      : conversationsForCase(caseId);
  const preferred = conversations[0] ?? null;
  const active = resolveActive(conversations, preferred?.id ?? null);
  return {
    mailboxes: PILOT_DEMO_MAILBOXES,
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
      const conversations = conversationsForCase(action.caseId);
      const preferred =
        conversations.find((item) => item.caseId === action.caseId) ??
        conversations[0] ??
        null;
      return {
        mailboxes: PILOT_DEMO_MAILBOXES,
        conversations,
        ...resolveActive(conversations, preferred?.id ?? null),
      };
    }
    case 'select-conversation':
      return {
        ...state,
        ...resolveActive(state.conversations, action.conversationId),
      };
    case 'reset-conversation-runtime':
      return createInitialConversationRuntimeState(null);
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

/**
 * Optional hook point for transport registry (unused until PT-12).
 * Keeps adapters injectable without coupling Runtime to IMAP/SMTP.
 */
export function withMailTransportRegistry(
  _registry: PilotMailTransportRegistry = emptyPilotMailTransportRegistry,
): PilotMailTransportRegistry {
  return _registry;
}
