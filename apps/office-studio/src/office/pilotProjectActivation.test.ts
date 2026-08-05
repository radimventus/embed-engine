/**
 * R-001 — Select Project must activate the full Office working environment.
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  inboxMessagesForActiveProject,
  planPilotProjectActivation,
} from './pilotProjectActivation';
import { createInitialInboxRuntimeState } from './pilotInboxRuntime';
import {
  getPilotWorkspaceCase,
  PILOT_TERMINAL_DEFAULT_VIEW,
  PILOT_WORKSPACE_DEMO_CASES,
} from './pilotWorkspaceModel';

describe('R-001 project activation', () => {
  it('switches Detail + Workflow + Conversation + Timeline synchronously', () => {
    const target = PILOT_WORKSPACE_DEMO_CASES[1]!;
    const plan = planPilotProjectActivation({
      caseId: target.id,
      cases: PILOT_WORKSPACE_DEMO_CASES,
      lookup: getPilotWorkspaceCase,
      inbox: createInitialInboxRuntimeState(),
    });

    assert.equal(plan.activeCaseId, target.id);
    assert.equal(plan.activeCase?.label, target.label);
    assert.equal(plan.terminalView, 'detail');
    assert.ok(plan.workflow.steps.length > 0);
    assert.equal(plan.timeline.caseId, target.id);
    assert.equal(plan.conversation.conversations.every(
      (item) => item.caseId === null || item.caseId === target.id,
    ), true);
  });

  it('clears project context back to default Inbox view', () => {
    const plan = planPilotProjectActivation({
      caseId: null,
      cases: PILOT_WORKSPACE_DEMO_CASES,
      lookup: getPilotWorkspaceCase,
      inbox: createInitialInboxRuntimeState(),
    });

    assert.equal(plan.activeCaseId, null);
    assert.equal(plan.activeCase, null);
    assert.equal(plan.terminalView, PILOT_TERMINAL_DEFAULT_VIEW);
    assert.equal(plan.timeline.caseId, null);
  });

  it('scopes inbox messages to the active project', () => {
    const messages = [
      {
        id: 'm1',
        senderName: 'A',
        senderEmail: 'a@x.cz',
        subject: 'One',
        preview: 'One',
        receivedAt: '2026-08-04T10:00:00.000Z',
        status: 'unread' as const,
        category: 'new' as const,
        caseId: 'case-dse-starter',
      },
      {
        id: 'm2',
        senderName: 'B',
        senderEmail: 'b@x.cz',
        subject: 'Two',
        preview: 'Two',
        receivedAt: '2026-08-04T11:00:00.000Z',
        status: 'unread' as const,
        category: 'new' as const,
        caseId: 'case-nord-pilot',
      },
      {
        id: 'm3',
        senderName: 'C',
        senderEmail: 'c@x.cz',
        subject: 'Unassigned',
        preview: 'Unassigned',
        receivedAt: '2026-08-04T12:00:00.000Z',
        status: 'unread' as const,
        category: 'unassigned' as const,
        caseId: null,
      },
    ];

    assert.deepEqual(
      inboxMessagesForActiveProject(messages, 'case-nord-pilot').map(
        (item) => item.id,
      ),
      ['m2'],
    );
    assert.equal(inboxMessagesForActiveProject(messages, null).length, 3);
  });

  it('drops inbox selection that does not belong to the next project', () => {
    const inbox = {
      ...createInitialInboxRuntimeState(),
      selectedMessageId: 'foreign-msg',
      messages: [
        {
          id: 'foreign-msg',
          senderName: 'X',
          senderEmail: 'x@x.cz',
          subject: 'Other',
          preview: 'Other',
          receivedAt: '2026-08-04T10:00:00.000Z',
          status: 'read' as const,
          category: 'new' as const,
          caseId: 'case-dse-starter',
        },
      ],
    };

    const plan = planPilotProjectActivation({
      caseId: 'case-nord-pilot',
      cases: PILOT_WORKSPACE_DEMO_CASES,
      lookup: getPilotWorkspaceCase,
      inbox,
    });

    assert.equal(plan.inboxSelectedMessageId, null);
  });
});
