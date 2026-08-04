/**
 * CAP-OP-03 / PT-06 — Inbox Runtime tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  PILOT_INBOX_CATEGORIES,
  PILOT_INBOX_DEMO_MESSAGES,
  messagesInCategory,
} from './pilotInboxModel';
import {
  createInitialInboxRuntimeState,
  reducePilotInbox,
} from './pilotInboxRuntime';
import {
  buildInboxMessageAssignedEvent,
  buildInboxMessageSelectedEvent,
  buildInboxMessageUnassignedEvent,
} from './pilotInboxTimeline';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-03 inbox runtime', () => {
  it('exposes Nové / Čeká na odpověď / Nepřiřazené / Archiv categories', () => {
    assert.deepEqual(
      PILOT_INBOX_CATEGORIES.map((item) => item.label),
      ['Nové', 'Čeká na odpověď', 'Nepřiřazené', 'Archiv'],
    );
    assert.ok(PILOT_INBOX_DEMO_MESSAGES.length >= 4);
    assert.ok(messagesInCategory(PILOT_INBOX_DEMO_MESSAGES, 'unassigned').length >= 1);
  });

  it('assigns and unassigns commercial cases in-memory', () => {
    let state = createInitialInboxRuntimeState();
    const unassigned = state.messages.find((item) => item.caseId === null);
    assert.ok(unassigned);

    state = reducePilotInbox(state, {
      type: 'assign-case',
      messageId: unassigned!.id,
      caseId: 'case-nord-pilot',
    });
    const assigned = state.messages.find((item) => item.id === unassigned!.id);
    assert.equal(assigned?.caseId, 'case-nord-pilot');
    assert.equal(assigned?.category, 'new');
    assert.equal(state.selectedMessageId, unassigned!.id);

    state = reducePilotInbox(state, {
      type: 'assign-case',
      messageId: unassigned!.id,
      caseId: 'case-dse-starter',
    });
    assert.equal(
      state.messages.find((item) => item.id === unassigned!.id)?.caseId,
      'case-dse-starter',
    );

    state = reducePilotInbox(state, {
      type: 'unassign-case',
      messageId: unassigned!.id,
    });
    const cleared = state.messages.find((item) => item.id === unassigned!.id);
    assert.equal(cleared?.caseId, null);
    assert.equal(cleared?.category, 'unassigned');
  });

  it('marks unread messages read on select', () => {
    let state = createInitialInboxRuntimeState();
    const unread = state.messages.find((item) => item.status === 'unread');
    assert.ok(unread);
    state = reducePilotInbox(state, {
      type: 'select-message',
      messageId: unread!.id,
    });
    assert.equal(
      state.messages.find((item) => item.id === unread!.id)?.status,
      'read',
    );
  });

  it('builds Timeline integration payloads without Event Catalog coupling', () => {
    const selected = buildInboxMessageSelectedEvent({
      messageId: 'msg-1',
      caseId: 'case-dse-starter',
      category: 'new',
      subject: 'Test',
      occurredAt: '2026-08-04T12:00:00.000Z',
    });
    assert.equal(selected.type, 'inbox.message.selected');
    assert.equal(
      buildInboxMessageAssignedEvent({
        messageId: 'msg-1',
        caseId: 'case-dse-starter',
        category: 'new',
        subject: 'Test',
      }).type,
      'inbox.message.assigned',
    );
    assert.equal(
      buildInboxMessageUnassignedEvent({
        messageId: 'msg-1',
        category: 'unassigned',
        subject: 'Test',
      }).type,
      'inbox.message.unassigned',
    );

    const timeline = read('office/pilotInboxTimeline.ts');
    assert.doesNotMatch(timeline, /localStorage/);
    assert.doesNotMatch(timeline, /officeEventCatalog/);
  });

  it('wires Inbox Runtime into terminal and PilotWorkspaceProvider', () => {
    const inbox = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    const context = read('office/PilotWorkspaceContext.tsx');
    const runtime = read('office/pilotInboxRuntime.ts');

    assert.match(inbox, /data-inbox-runtime/);
    assert.match(inbox, /pilot-inbox-assignment/);
    assert.match(inbox, /pilot-inbox-assign-select/);
    assert.match(inbox, /pilot-inbox-unassign/);
    assert.match(inbox, /pilot-inbox-timeline-slot/);
    assert.match(inbox, /selectInboxMessage/);
    assert.match(inbox, /assignInboxCase/);
    assert.match(context, /selectInboxMessage/);
    assert.match(context, /assignInboxCase/);
    assert.match(context, /unassignInboxCase/);
    assert.match(context, /notifyInboxTimeline/);
    assert.match(context, /setActiveCaseId/);
    assert.match(runtime, /assign-case/);
    assert.doesNotMatch(runtime, /localStorage/);
  });
});
