/**
 * CAP-OP-03 / PT-06 — Timeline integration point for Inbox Runtime.
 * Interfaces only — Timeline Runtime / Event Catalog remain out of scope.
 */

import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import type {
  PilotInboxMessageId,
  PilotInboxCategoryId,
} from './pilotInboxModel';

export type PilotInboxTimelineEventType =
  | 'inbox.message.selected'
  | 'inbox.message.assigned'
  | 'inbox.message.unassigned';

export type PilotInboxTimelineEvent = {
  readonly type: PilotInboxTimelineEventType;
  readonly occurredAt: string;
  readonly messageId: PilotInboxMessageId;
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly category: PilotInboxCategoryId | null;
  readonly subject: string | null;
};

export type PilotInboxTimelineIntegration = {
  readonly emitTimelineEvent?: (
    event: PilotInboxTimelineEvent,
  ) => Promise<void> | void;
};

export function buildInboxMessageSelectedEvent(input: {
  readonly messageId: PilotInboxMessageId;
  readonly caseId: PilotWorkspaceCaseId | null;
  readonly category: PilotInboxCategoryId;
  readonly subject: string;
  readonly occurredAt?: string;
}): PilotInboxTimelineEvent {
  return {
    type: 'inbox.message.selected',
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    messageId: input.messageId,
    caseId: input.caseId,
    category: input.category,
    subject: input.subject,
  };
}

export function buildInboxMessageAssignedEvent(input: {
  readonly messageId: PilotInboxMessageId;
  readonly caseId: PilotWorkspaceCaseId;
  readonly category: PilotInboxCategoryId;
  readonly subject: string;
  readonly occurredAt?: string;
}): PilotInboxTimelineEvent {
  return {
    type: 'inbox.message.assigned',
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    messageId: input.messageId,
    caseId: input.caseId,
    category: input.category,
    subject: input.subject,
  };
}

export function buildInboxMessageUnassignedEvent(input: {
  readonly messageId: PilotInboxMessageId;
  readonly category: PilotInboxCategoryId;
  readonly subject: string;
  readonly occurredAt?: string;
}): PilotInboxTimelineEvent {
  return {
    type: 'inbox.message.unassigned',
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    messageId: input.messageId,
    caseId: null,
    category: input.category,
    subject: input.subject,
  };
}

/** Optional no-op notify — PT-07 can wire Event Catalog without UI refactor. */
export async function notifyInboxTimeline(
  integrations: PilotInboxTimelineIntegration,
  event: PilotInboxTimelineEvent,
): Promise<void> {
  await integrations.emitTimelineEvent?.(event);
}
