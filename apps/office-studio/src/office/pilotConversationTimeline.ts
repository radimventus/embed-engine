/**
 * CAP-OP-10 — Timeline projection from Conversation Runtime (sole event source).
 */

import type { ConversationMailStore } from '../mail/conversationMailStore';
import {
  getConversationMailStore,
  getStoreConversation,
} from '../mail/conversationMailStore';
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

  return store.messages
    .filter((message) => conversationIds.has(message.conversationId))
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((message) => {
      const conversation = getStoreConversation(message.conversationId, store);
      const incoming = message.direction === 'incoming';
      return {
        id: `tl-msg-${message.id}`,
        caseId,
        kind: incoming ? ('email.received' as const) : ('email.sent' as const),
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
    });
}

export async function loadTimelineForCaseFromConversation(
  caseId: PilotWorkspaceCaseId | null,
  store: ConversationMailStore = getConversationMailStore(),
): Promise<readonly PilotTimelineEvent[]> {
  return projectTimelineFromConversation(caseId, store);
}
