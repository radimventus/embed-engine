/**
 * PT-15 — Document timeline journal (project-scoped).
 * Merged into Conversation Timeline projection.
 */

import type { PilotTimelineEvent } from './pilotTimelineModel';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

const events: PilotTimelineEvent[] = [];

export function appendDocumentTimelineEvent(event: PilotTimelineEvent): void {
  events.push(event);
}

export function listDocumentTimelineEventsForCase(
  caseId: PilotWorkspaceCaseId,
): readonly PilotTimelineEvent[] {
  return events
    .filter((item) => item.caseId === caseId)
    .slice()
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

export function resetDocumentTimelineJournalForTests(): void {
  events.length = 0;
}
