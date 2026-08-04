/**
 * CAP-OP-04 / PT-07 — Timeline Runtime tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createEmptyTimelineRuntimeState,
  loadTimelineForCase,
  reducePilotTimeline,
} from './pilotTimelineRuntime';
import {
  groupTimelineEventsByDay,
  PILOT_TIMELINE_EVENT_KIND_LABELS,
} from './pilotTimelineModel';
import {
  listMockTimelineEventsForCase,
  resetPilotTimelineStoreForTests,
} from './pilotTimelineStore';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-04 timeline runtime', () => {
  beforeEach(() => {
    resetPilotTimelineStoreForTests();
  });

  it('exposes required commercial event kinds', () => {
    assert.deepEqual(Object.keys(PILOT_TIMELINE_EVENT_KIND_LABELS).sort(), [
      'builder.ready',
      'document.attached',
      'document.generated',
      'document.sent',
      'email.received',
      'email.sent',
      'note.added',
      'offer.sent',
      'offer.viewed',
      'office.task',
      'order.confirmed',
      'payment.received',
      'workflow.synced',
    ]);
  });

  it('projects mock events for a case chronologically by day', async () => {
    const events = await loadTimelineForCase('case-dse-starter');
    assert.ok(events.length >= 6);
    assert.ok(
      events.every((event) => event.caseId === 'case-dse-starter'),
    );
    for (let index = 1; index < events.length; index += 1) {
      assert.ok(
        events[index - 1]!.occurredAt >= events[index]!.occurredAt,
      );
    }

    const groups = groupTimelineEventsByDay(events);
    assert.ok(groups.length >= 2);
    assert.ok(groups[0]!.dayKey >= groups[groups.length - 1]!.dayKey);
  });

  it('switches timeline projection when case changes', async () => {
    let state = createEmptyTimelineRuntimeState();
    const dse = await loadTimelineForCase('case-dse-starter');
    state = reducePilotTimeline(state, {
      type: 'load-case',
      caseId: 'case-dse-starter',
      events: dse,
    });
    state = reducePilotTimeline(state, {
      type: 'select-event',
      eventId: dse[0]!.id,
    });
    assert.equal(state.selectedEventId, dse[0]!.id);

    const nord = await loadTimelineForCase('case-nord-pilot');
    state = reducePilotTimeline(state, {
      type: 'load-case',
      caseId: 'case-nord-pilot',
      events: nord,
    });
    assert.equal(state.caseId, 'case-nord-pilot');
    assert.equal(state.selectedEventId, null);
    assert.ok(state.events.every((event) => event.caseId === 'case-nord-pilot'));
    assert.notEqual(
      listMockTimelineEventsForCase('case-nord-pilot').length,
      listMockTimelineEventsForCase('case-dse-starter').length,
    );
  });

  it('selects event detail without mutation APIs', () => {
    let state = createEmptyTimelineRuntimeState();
    const events = listMockTimelineEventsForCase('case-atelier-studio');
    state = reducePilotTimeline(state, {
      type: 'load-case',
      caseId: 'case-atelier-studio',
      events,
    });
    state = reducePilotTimeline(state, {
      type: 'select-event',
      eventId: events[0]!.id,
    });
    assert.equal(state.selectedEvent?.id, events[0]!.id);
    state = reducePilotTimeline(state, { type: 'clear-selection' });
    assert.equal(state.selectedEvent, null);
  });

  it('wires Timeline Runtime into provider from Conversation (sole source)', () => {
    const timelineUi = read(
      'features/pilot-workspace/terminal/PilotTerminalTimeline.tsx',
    );
    const context = read('office/PilotWorkspaceContext.tsx');
    const projection = read('office/pilotConversationTimeline.ts');

    assert.match(timelineUi, /data-timeline-runtime/);
    assert.match(timelineUi, /pilot-timeline-list/);
    assert.match(timelineUi, /usePilotWorkspaceContext/);
    assert.match(context, /loadTimelineForCaseFromConversation/);
    assert.doesNotMatch(context, /loadTimelineForCase\(/);
    assert.match(context, /selectTimelineEvent/);
    assert.match(projection, /projectTimelineFromConversation/);
    assert.match(projection, /email.received/);
    assert.match(projection, /email.sent/);
  });
});
