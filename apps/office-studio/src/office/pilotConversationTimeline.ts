/**
 * CAP-OP-10 — Timeline projection from Conversation Runtime (sole event source).
 */

import type { ConversationMailStore } from '../mail/conversationMailStore';
import {
  getConversationMailStore,
  getStoreConversation,
} from '../mail/conversationMailStore';
import { listDocumentTimelineEventsForCase } from './officeDocumentTimelineJournal';
import { listAutomationTimelineEventsForCase } from './officeAutomationTimelineJournal';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';
import type { PilotTimelineEvent } from './pilotTimelineModel';

export function projectTimelineFromConversation(
  caseId: PilotWorkspaceCaseId | null,
  store: ConversationMailStore = getConversationMailStore(),
): readonly PilotTimelineEvent[] {
  if (caseId === null) return [];

  const conversationIds = new Set(
    store.conversations
      .filter((item) => item.caseId === caseId)
      .map((item) => item.id),
  );

  const messageEvents = store.messages
    .filter((message) => conversationIds.has(message.conversationId))
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .flatMap((message) => {
      const conversation = getStoreConversation(message.conversationId, store);
      const incoming = message.direction === 'incoming';
      const emailEvent: PilotTimelineEvent = {
        id: `tl-msg-${message.id}`,
        caseId,
        kind: incoming ? 'email.received' : 'email.sent',
        title: incoming ? 'Email Received' : 'Email Sent',
        summary: message.subject,
        detail: [
          conversation?.subject ?? message.subject,
          `${message.fromEmail} → ${message.toEmail}`,
          `origin=${message.origin}`,
          message.body,
        ].join('\n'),
        occurredAt: message.createdAt,
      };

      const documentEvents =
        message.attachments?.map((attachment) => ({
          id: `tl-msg-doc-${message.id}-${attachment.documentId}`,
          caseId,
          kind: 'document.sent' as const,
          title: attachment.fileName,
          summary: `Příloha · ${attachment.fileName}`,
          detail: `documentId=${attachment.documentId}\nmime=${attachment.mimeType}`,
          occurredAt: message.createdAt,
        })) ?? [];

      return [emailEvent, ...documentEvents];
    });

  const documentJournal = listDocumentTimelineEventsForCase(caseId);
  const automationJournal = listAutomationTimelineEventsForCase(caseId);
  return [...messageEvents, ...documentJournal, ...automationJournal].sort(
    (a, b) => a.occurredAt.localeCompare(b.occurredAt),
  );
}

export async function loadTimelineForCaseFromConversation(
  caseId: PilotWorkspaceCaseId | null,
  store: ConversationMailStore = getConversationMailStore(),
): Promise<readonly PilotTimelineEvent[]> {
  return projectTimelineFromConversation(caseId, store);
}
