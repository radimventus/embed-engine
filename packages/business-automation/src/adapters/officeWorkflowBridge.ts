/**
 * PT-13 — Office Workflow / Conversation → Automation bridge.
 * Workflow publishes message events; Automation plans reactions.
 */

import {
  buildBusinessEvent,
  type BusinessEvent,
} from '../domain/businessEvents';
import type { AutomationRuntime } from '../runtime/automationRuntime';

export type OfficeWorkflowMessageEventLike = {
  readonly type: 'workflow.message.received' | 'workflow.message.sent';
  readonly messageId: string;
  readonly conversationId: string;
  readonly caseId: string | null;
  readonly subject: string;
  readonly occurredAt: string;
};

export function mapWorkflowMessageToBusinessEvent(
  event: OfficeWorkflowMessageEventLike,
): BusinessEvent {
  const kind =
    event.type === 'workflow.message.received'
      ? 'WorkflowMessageReceived'
      : 'WorkflowMessageSent';

  return buildBusinessEvent({
    kind,
    occurredAt: event.occurredAt,
    source: 'office-workflow',
    correlationId: event.caseId ?? event.conversationId,
    payload: {
      messageId: event.messageId,
      conversationId: event.conversationId,
      caseId: event.caseId,
      subject: event.subject,
    },
  });
}

export type OfficeWorkflowAutomationSurface = {
  readonly emitMessageEvent?: (
    event: OfficeWorkflowMessageEventLike,
  ) => void | Promise<void>;
};

export function createOfficeWorkflowAutomationBridge(
  runtime: AutomationRuntime,
): OfficeWorkflowAutomationSurface {
  return {
    emitMessageEvent: async (event) => {
      await runtime.publish(mapWorkflowMessageToBusinessEvent(event));
    },
  };
}
