/**
 * CAP-OP-10 — Inbox as Conversation projection tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { resetConversationMailStore } from '../mail/conversationMailStore';
import {
  PILOT_INBOX_CATEGORIES,
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

describe('CAP-OP-10 inbox conversation projection', () => {
  beforeEach(() => {
    resetConversationMailStore();
  });

  it('exposes Nové / Čeká na odpověď / Nepřiřazené / Archiv categories', () => {
    assert.deepEqual(
      PILOT_INBOX_CATEGORIES.map((item) => item.label),
      ['Nové', 'Čeká na odpověď', 'Nepřiřazené', 'Archiv'],
    );
    const state = createInitialInboxRuntimeState();
    assert.ok(state.messages.length >= 4);
    assert.ok(messagesInCategory(state.messages, 'unassigned').length >= 1);
  });

  it('assigns and unassigns commercial cases on Conversation store', () => {
    let state = createInitialInboxRuntimeState();
    const unassigned = state.messages.find((item) => item.caseId === null);
    assert.ok(unassigned);

    state = reducePilotInbox(state, {
      type: 'assign-case',
      messageId: unassigned!.id,
      caseId: 'harmony-124',
    });
    const assigned = state.messages.find((item) => item.id === unassigned!.id);
    assert.equal(assigned?.caseId, 'harmony-124');
    assert.equal(assigned?.category, 'new');
    assert.equal(state.selectedMessageId, unassigned!.id);

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
      caseId: 'villa-168',
      category: 'new',
      subject: 'Test',
      occurredAt: '2026-08-04T12:00:00.000Z',
    });
    assert.equal(selected.type, 'inbox.message.selected');
    assert.equal(
      buildInboxMessageAssignedEvent({
        messageId: 'msg-1',
        caseId: 'villa-168',
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

  it('wires Conversation projection Inbox into terminal and Provider', () => {
    const inbox = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    const context = read('office/PilotWorkspaceContext.tsx');
    const runtime = read('office/pilotInboxRuntime.ts');

    assert.match(inbox, /data-inbox-runtime="conversation"/);
    assert.match(inbox, /mailSessionActive/);
    assert.match(inbox, /pilot-inbox-assignment/);
    assert.match(context, /wirePilotMailTransportSession/);
    assert.match(context, /mailSessionActive: true/);
    assert.match(context, /loadTimelineForCaseFromConversation/);
    assert.match(context, /projectInboxFromConversationStore|refresh-from-conversation/);
    assert.match(runtime, /projectInboxFromConversationStore/);
    assert.doesNotMatch(runtime, /PILOT_INBOX_DEMO_MESSAGES/);
    assert.doesNotMatch(context, /nodemailer|imapflow|IMAP_HOST|SMTP_HOST/);
  });
});
