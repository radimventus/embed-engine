/**
 * R-001 — Project activation plan for Office working environment.
 * Select Project must synchronously switch the full work context.
 */

import { resolveCaseWithWorkflowSync } from './commercialWorkflowSync';
import {
  createInitialConversationRuntimeState,
  type PilotConversationRuntimeState,
} from './pilotConversationRuntime';
import type { PilotInboxMessage } from './pilotInboxModel';
import type { PilotInboxRuntimeState } from './pilotInboxRuntime';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import {
  createEmptyTimelineRuntimeState,
  reducePilotTimeline,
  type PilotTimelineRuntimeState,
} from './pilotTimelineRuntime';
import {
  createInitialWorkflowRuntimeState,
  type PilotWorkflowRuntimeState,
} from './pilotWorkflowRuntime';
import {
  PILOT_TERMINAL_DEFAULT_VIEW,
  type PilotTerminalViewId,
  type PilotWorkspaceCase,
  type PilotWorkspaceCaseId,
} from './pilotWorkspaceModel';

export type PilotProjectActivation = {
  readonly activeCaseId: PilotWorkspaceCaseId | null;
  readonly activeCase: PilotWorkspaceCase | null;
  readonly terminalView: PilotTerminalViewId;
  readonly workflow: PilotWorkflowRuntimeState;
  readonly conversation: PilotConversationRuntimeState;
  readonly timeline: PilotTimelineRuntimeState;
  readonly inboxSelectedMessageId: string | null;
};

/**
 * Inbox scoped to the active project.
 * No project → full mailbox. With project → only that case's messages.
 */
export function inboxMessagesForActiveProject(
  messages: readonly PilotInboxMessage[],
  activeCaseId: PilotWorkspaceCaseId | null,
): readonly PilotInboxMessage[] {
  if (activeCaseId === null) return messages;
  return messages.filter((message) => message.caseId === activeCaseId);
}

export function resolveWorkspaceCase(
  caseId: PilotWorkspaceCaseId | null,
  cases: readonly PilotWorkspaceCase[],
  lookup: (id: PilotWorkspaceCaseId) => PilotWorkspaceCase | null,
): PilotWorkspaceCase | null {
  if (caseId === null) return null;
  const found = cases.find((item) => item.id === caseId) ?? lookup(caseId);
  return found === null ? null : resolveCaseWithWorkflowSync(found);
}

/**
 * Pure activation snapshot — applied synchronously on Select Project.
 */
export function planPilotProjectActivation(input: {
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly cases: readonly PilotWorkspaceCase[];
  readonly lookup: (id: PilotWorkspaceCaseId) => PilotWorkspaceCase | null;
  readonly inbox: PilotInboxRuntimeState;
}): PilotProjectActivation {
  const activeCase = resolveWorkspaceCase(
    input.caseId,
    input.cases,
    input.lookup,
  );
  const activeCaseId = activeCase?.id ?? input.caseId;
  const timelineEvents = projectTimelineFromConversation(activeCaseId);
  const timeline = reducePilotTimeline(createEmptyTimelineRuntimeState(), {
    type: 'load-case',
    caseId: activeCaseId,
    events: timelineEvents,
  });
  const scoped = inboxMessagesForActiveProject(
    input.inbox.messages,
    activeCaseId,
  );
  const selectedStillVisible =
    input.inbox.selectedMessageId !== null &&
    scoped.some((message) => message.id === input.inbox.selectedMessageId);

  return {
    activeCaseId,
    activeCase,
    terminalView:
      activeCaseId === null ? PILOT_TERMINAL_DEFAULT_VIEW : 'journey',
    workflow: createInitialWorkflowRuntimeState(activeCase),
    conversation: createInitialConversationRuntimeState(activeCaseId),
    timeline,
    inboxSelectedMessageId: selectedStillVisible
      ? input.inbox.selectedMessageId
      : null,
  };
}
