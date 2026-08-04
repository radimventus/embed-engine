/**
 * CAP-OP-10 / PT-13 — Workflow message-event interface (no business logic).
 * Publishes into Business Automation via Office host bridge.
 */

import type { PilotConversationId } from './pilotConversationModel';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

export type PilotWorkflowMessageEventType =
  | 'workflow.message.received'
  | 'workflow.message.sent';

export type PilotWorkflowMessageEvent = {
  readonly type: PilotWorkflowMessageEventType;
  readonly messageId: string;
  readonly conversationId: PilotConversationId;
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly subject: string;
  readonly occurredAt: string;
};

export type PilotWorkflowMessageIntegration = {
  readonly emitMessageEvent?: (
    event: PilotWorkflowMessageEvent,
  ) => void | Promise<void>;
};

export function buildWorkflowMessageEvent(input: {
  readonly direction: 'incoming' | 'outgoing';
  readonly messageId: string;
  readonly conversationId: PilotConversationId;
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly subject: string;
  readonly occurredAt: string;
}): PilotWorkflowMessageEvent {
  return {
    type:
      input.direction === 'incoming'
        ? 'workflow.message.received'
        : 'workflow.message.sent',
    messageId: input.messageId,
    conversationId: input.conversationId,
    caseId: input.caseId,
    subject: input.subject,
    occurredAt: input.occurredAt,
  };
}

export async function notifyWorkflowMessageEvent(
  integration: PilotWorkflowMessageIntegration,
  event: PilotWorkflowMessageEvent,
): Promise<void> {
  await integration.emitMessageEvent?.(event);
}
