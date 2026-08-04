/**
 * CAP-OP-10 — Inbox Runtime as Conversation projection (session UI state only).
 * Message body lives in Conversation mail store — not a parallel Inbox store.
 */

import {
  assignConversationCaseForMessage,
  projectInboxFromConversationStore,
  unassignConversationCaseForMessage,
} from './pilotInboxProjection';
import type { PilotInboxMessage, PilotInboxMessageId } from './pilotInboxModel';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotInboxRuntimeState = {
  readonly messages: readonly PilotInboxMessage[];
  readonly selectedMessageId: PilotInboxMessageId | null;
  readonly readMessageIds: ReadonlySet<string>;
};

export type PilotInboxRuntimeAction =
  | { readonly type: 'refresh-from-conversation' }
  | {
      readonly type: 'select-message';
      readonly messageId: PilotInboxMessageId | null;
    }
  | {
      readonly type: 'assign-case';
      readonly messageId: PilotInboxMessageId;
      readonly caseId: PilotWorkspaceCaseId;
    }
  | {
      readonly type: 'unassign-case';
      readonly messageId: PilotInboxMessageId;
    }
  | { readonly type: 'reset-inbox' };

export function createInitialInboxRuntimeState(): PilotInboxRuntimeState {
  return {
    messages: projectInboxFromConversationStore(),
    selectedMessageId: null,
    readMessageIds: new Set(),
  };
}

export function reducePilotInbox(
  state: PilotInboxRuntimeState,
  action: PilotInboxRuntimeAction,
): PilotInboxRuntimeState {
  switch (action.type) {
    case 'refresh-from-conversation':
      return {
        ...state,
        messages: projectInboxFromConversationStore(undefined, state.readMessageIds),
      };
    case 'select-message': {
      if (action.messageId === null) {
        return { ...state, selectedMessageId: null };
      }
      const current = state.messages.find(
        (item) => item.id === action.messageId,
      );
      if (current === undefined) {
        return { ...state, selectedMessageId: null };
      }
      const readMessageIds = new Set(state.readMessageIds);
      readMessageIds.add(action.messageId);
      return {
        selectedMessageId: action.messageId,
        readMessageIds,
        messages: projectInboxFromConversationStore(undefined, readMessageIds),
      };
    }
    case 'assign-case': {
      assignConversationCaseForMessage(action.messageId, action.caseId);
      const readMessageIds = new Set(state.readMessageIds);
      readMessageIds.add(action.messageId);
      return {
        selectedMessageId: action.messageId,
        readMessageIds,
        messages: projectInboxFromConversationStore(undefined, readMessageIds),
      };
    }
    case 'unassign-case': {
      unassignConversationCaseForMessage(action.messageId);
      return {
        ...state,
        selectedMessageId: action.messageId,
        messages: projectInboxFromConversationStore(
          undefined,
          state.readMessageIds,
        ),
      };
    }
    case 'reset-inbox':
      return createInitialInboxRuntimeState();
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
