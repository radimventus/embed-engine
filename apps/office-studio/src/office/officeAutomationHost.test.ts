/**
 * PT-13 — Office Automation host wires Conversation + Mail Session ports.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { buildBusinessEvent } from '@embed-engine/business-automation';

import {
  createOfficeAutomationHost,
  resetOfficeAutomationHostForTests,
} from './officeAutomationHost';

describe('PT-13 Office Automation host wiring', () => {
  it('connects Automation Runtime to Conversation and Mail Session ports', async () => {
    resetOfficeAutomationHostForTests();
    const host = createOfficeAutomationHost();

    assert.ok(host.mailSession);
    assert.equal(typeof host.mailSession.syncMailbox, 'function');
    assert.equal(typeof host.mailSession.sendSystemMail, 'function');

    await host.runtime.publish(
      buildBusinessEvent({
        kind: 'PilotReady',
        source: 'system',
        correlationId: 'case-1',
        payload: { caseId: 'case-1' },
      }),
    );

    assert.equal(host.journal.conversationEvents.length, 1);
    assert.equal(host.journal.conversationEvents[0]?.kind, 'PilotReady');
    assert.ok(
      host.journal.mailIntents.some(
        (intent) => intent.actionId === 'SendWelcomeMail',
      ),
    );
    assert.equal(
      host.journal.mailIntents[0]?.mailboxId,
      'mbx-conis-contact',
    );
    assert.equal(host.journal.workflowPlans.length, 1);
    assert.ok(host.journal.officeTasks.length >= 1);
    assert.ok(
      host.journal.officeTasks.some((task) => task.kind === 'waiting_builder'),
    );

    await host.workflowBridge.emitMessageEvent?.({
      type: 'workflow.message.received',
      messageId: 'msg-1',
      conversationId: 'conv-1',
      caseId: 'case-1',
      subject: 'Pilot',
      occurredAt: '2026-08-04T18:00:00.000Z',
    });

    assert.ok(
      host.journal.conversationEvents.some(
        (event) => event.kind === 'WorkflowMessageReceived',
      ),
    );
  });
});
