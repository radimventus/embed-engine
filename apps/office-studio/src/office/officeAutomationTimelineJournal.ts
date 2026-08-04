/**
 * PT-16 — Automation timeline journal (workflow · tasks · commercial events).
 * Merged into Conversation Timeline projection — no manual sync.
 */

import type { PilotTimelineEvent } from './pilotTimelineModel';
import type { PilotWorkspaceCaseId } from './pilotWorkspaceModel';

const events: PilotTimelineEvent[] = [];

export function appendAutomationTimelineEvent(event: PilotTimelineEvent): void {
  events.push(event);
}

export function listAutomationTimelineEventsForCase(
  caseId: PilotWorkspaceCaseId,
): readonly PilotTimelineEvent[] {
  return events
    .filter((item) => item.caseId === caseId)
    .slice()
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
}

export function resetAutomationTimelineJournalForTests(): void {
  events.length = 0;
}
