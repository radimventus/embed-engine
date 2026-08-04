/**
 * CAP-OP-03 / PT-06 — Inbox Runtime reducer (in-memory session state).
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import {
  PILOT_INBOX_DEMO_MESSAGES,
  type PilotInboxMessage,
  type PilotInboxMessageId,
} from './pilotInboxModel';

export type PilotInboxRuntimeState = {
  readonly messages: readonly PilotInboxMessage[];
  readonly selectedMessageId: PilotInboxMessageId | null;
};

export type PilotInboxRuntimeAction =
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
    messages: PILOT_INBOX_DEMO_MESSAGES,
    selectedMessageId: null,
  };
}

function patchMessage(
  messages: readonly PilotInboxMessage[],
  messageId: PilotInboxMessageId,
  patch: Partial<PilotInboxMessage>,
): readonly PilotInboxMessage[] {
  return messages.map((message) =>
    message.id === messageId ? { ...message, ...patch } : message,
  );
}

/**
 * Assigning a case moves an unassigned message into Nové.
 * Unassigning moves a non-archive message back to Nepřiřazené.
 */
export function reducePilotInbox(
  state: PilotInboxRuntimeState,
  action: PilotInboxRuntimeAction,
): PilotInboxRuntimeState {
  switch (action.type) {
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
      return {
        ...state,
        selectedMessageId: action.messageId,
        messages:
          current.status === 'unread'
            ? patchMessage(state.messages, action.messageId, {
                status: 'read',
              })
            : state.messages,
      };
    }
    case 'assign-case': {
      const current = state.messages.find(
        (item) => item.id === action.messageId,
      );
      if (current === undefined) return state;
      return {
        ...state,
        selectedMessageId: action.messageId,
        messages: patchMessage(state.messages, action.messageId, {
          caseId: action.caseId,
          category:
            current.category === 'unassigned' ? 'new' : current.category,
        }),
      };
    }
    case 'unassign-case': {
      const current = state.messages.find(
        (item) => item.id === action.messageId,
      );
      if (current === undefined) return state;
      return {
        ...state,
        selectedMessageId: action.messageId,
        messages: patchMessage(state.messages, action.messageId, {
          caseId: null,
          category: current.category === 'archive' ? 'archive' : 'unassigned',
        }),
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
