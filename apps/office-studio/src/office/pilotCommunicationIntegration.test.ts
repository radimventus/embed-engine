/**
 * CAP-OP-10 — Communication Platform integration (operational paths).
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { beforeEach, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createPilotMailSession,
  resetConversationMailStore,
  wirePilotMailTransportSession,
} from '../mail';
import { projectInboxFromConversationStore } from './pilotInboxProjection';
import { projectTimelineFromConversation } from './pilotConversationTimeline';
import {
  createInitialInboxRuntimeState,
  reducePilotInbox,
} from './pilotInboxRuntime';
import { buildWorkflowMessageEvent } from './pilotWorkflowMessageEvents';

const root = dirname(fileURLToPath(import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, '..', relative), 'utf8');
}

describe('CAP-OP-10 communication platform integration', () => {
  beforeEach(() => {
    resetConversationMailStore();
  });

  it('wires mail session for mbx-conis-contact without UI knowing IMAP/SMTP', () => {
    const session = wirePilotMailTransportSession({
      mailboxId: 'mbx-conis-contact',
    });
    assert.equal(typeof session.syncMailbox, 'function');
    assert.equal(typeof session.sendSystemMail, 'function');

    const app = read('OfficeStudioApp.tsx');
    const surface = read('features/pilot-workspace/OfficeWorkSurface.tsx');
    const context = read('office/PilotWorkspaceContext.tsx');
    const inboxUi = read(
      'features/pilot-workspace/terminal/PilotTerminalInbox.tsx',
    );
    assert.match(app, /DEFAULT_PILOT_MAILBOX_ID/);
    assert.match(app, /PilotWorkspaceProvider/);
    assert.match(surface, /data-mail-session="active"/);
    assert.match(context, /wirePilotMailTransportSession/);
    assert.match(context, /mailSessionActive: true/);
    assert.doesNotMatch(surface, /nodemailer|imapflow|createEnvMailTransport/);
    assert.doesNotMatch(context, /nodemailer|imapflow|IMAP_HOST|SMTP_HOST/);
    assert.doesNotMatch(inboxUi, /nodemailer|imapflow/);
  });

  it('IMAP sync → Conversation → Inbox projection → Timeline', async () => {
    const session = createPilotMailSession({
      mailboxId: 'mbx-conis-contact',
      operationalFetch: async (folder) => {
        if (folder !== 'INBOX') return [];
        return [
          {
            folder: 'INBOX',
            messageId: '<ops-imap-1@x.cz>',
            threadId: 'thread-ops-imap',
            fromEmail: 'jana@domysenergii.cz',
            toEmail: 'kontakt@conis.cz',
            subject: 'Operational IMAP',
            body: 'From IMAP path',
            createdAt: '2026-08-04T18:00:00.000Z',
          },
        ];
      },
    });

    const report = await session.syncMailbox('mbx-conis-contact');
    assert.equal(report.added, 1);

    const inbox = projectInboxFromConversationStore();
    assert.ok(inbox.some((item) => item.subject === 'Operational IMAP'));

    const timeline = projectTimelineFromConversation('villa-168');
    assert.ok(
      timeline.some(
        (event) =>
          event.kind === 'email.received' &&
          event.summary === 'Operational IMAP',
      ),
    );
  });

  it('SMTP send → Conversation → Timeline', async () => {
    const session = createPilotMailSession({
      mailboxId: 'mbx-conis-contact',
    });
    const message = await session.sendSystemMail({
      mailboxId: 'mbx-conis-contact',
      toEmail: 'jana@domysenergii.cz',
      subject: 'Operational SMTP',
      body: 'System mail body',
      caseId: 'villa-168',
      origin: 'SYSTEM',
    });
    assert.equal(message.direction, 'outgoing');
    assert.equal(message.origin, 'SYSTEM');

    const inbox = reducePilotInbox(createInitialInboxRuntimeState(), {
      type: 'refresh-from-conversation',
    });
    assert.ok(inbox.messages.some((item) => item.subject === 'Operational SMTP'));

    const timeline = projectTimelineFromConversation('villa-168');
    assert.ok(
      timeline.some(
        (event) =>
          event.kind === 'email.sent' && event.summary === 'Operational SMTP',
      ),
    );
  });

  it('exposes workflow message-event interface without business logic', () => {
    const event = buildWorkflowMessageEvent({
      direction: 'incoming',
      messageId: 'm1',
      conversationId: 'c1',
      caseId: 'villa-168',
      subject: 'Hi',
      occurredAt: '2026-08-04T12:00:00.000Z',
    });
    assert.equal(event.type, 'workflow.message.received');
    const catalog = read('office/pilotWorkflowCatalog.ts');
    const events = read('office/pilotWorkflowMessageEvents.ts');
    assert.match(catalog, /PilotWorkflowMessageIntegration/);
    assert.match(events, /workflow.message.received/);
    assert.match(events, /workflow.message.sent/);
    assert.match(events, /emitMessageEvent/);
  });

  it('removes dual Inbox Runtime store dependency', () => {
    const runtime = read('office/pilotInboxRuntime.ts');
    assert.match(runtime, /projectInboxFromConversationStore/);
    assert.doesNotMatch(runtime, /PILOT_INBOX_DEMO_MESSAGES/);
  });
});
