/**
 * PT-13 — Business Automation Foundation tests.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  AUTOMATION_ACTION_IDS,
  BUSINESS_EVENT_KINDS,
  buildBusinessEvent,
  createActionRegistry,
  createAutomationRuntime,
  createOfficeWorkflowAutomationBridge,
  createOfferAutomationIntegrations,
  DEFAULT_EVENT_ACTION_BINDINGS,
  mapOfferTimelineToBusinessEvents,
  mapWorkflowMessageToBusinessEvent,
  planActionsForEvent,
} from './index';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8');
}

describe('PT-13 business automation foundation', () => {
  it('exposes commercial business event catalog', () => {
    assert.deepEqual([...BUSINESS_EVENT_KINDS], [
      'OfferAccepted',
      'OrderConfirmed',
      'ProformaGenerated',
      'PaymentConfirmed',
      'PilotReady',
      'WorkflowMessageReceived',
      'WorkflowMessageSent',
    ]);
  });

  it('registers automation actions without transport logic', () => {
    assert.deepEqual([...AUTOMATION_ACTION_IDS], [
      'SendOfferMail',
      'SendProformaMail',
      'SendWelcomeMail',
      'NotifyOffice',
      'CreateBuilderTask',
    ]);
    const registry = createActionRegistry();
    assert.equal(registry.list().length, 5);
    assert.ok(registry.has('SendWelcomeMail'));
    assert.deepEqual(DEFAULT_EVENT_ACTION_BINDINGS.PilotReady, [
      'SendWelcomeMail',
      'CreateBuilderTask',
      'NotifyOffice',
    ]);
    assert.equal(planActionsForEvent('PaymentConfirmed').length, 1);
  });

  it('publishes workflow events and plans stub actions', async () => {
    const mailIntents: string[] = [];
    const conversationKinds: string[] = [];
    const workflowPlans: number[] = [];

    const runtime = createAutomationRuntime({
      ports: {
        mailSession: {
          notifyMailIntent: ({ actionId }) => {
            mailIntents.push(actionId);
          },
        },
        conversation: {
          notifyBusinessEvent: (event) => {
            conversationKinds.push(event.kind);
          },
        },
        workflow: {
          notifyActionPlan: ({ plan }) => {
            workflowPlans.push(plan.length);
          },
        },
      },
    });

    const record = await runtime.publish(
      buildBusinessEvent({
        kind: 'PaymentConfirmed',
        source: 'offer-experience',
        correlationId: 'ord-1',
        payload: { orderId: 'ord-1', amountCzk: 14970 },
      }),
    );

    assert.equal(record.plan.length, 1);
    assert.equal(record.plan[0]?.actionId, 'NotifyOffice');
    assert.equal(record.plan[0]?.status, 'completed');
    assert.deepEqual(conversationKinds, ['PaymentConfirmed']);
    assert.deepEqual(workflowPlans, [1]);
    assert.equal(mailIntents.length, 0);

    const pilot = await runtime.publish(
      buildBusinessEvent({
        kind: 'PilotReady',
        source: 'offer-experience',
        correlationId: 'ord-1',
      }),
    );
    assert.ok(pilot.plan.some((item) => item.actionId === 'SendWelcomeMail'));
    assert.ok(mailIntents.includes('SendWelcomeMail'));
    assert.equal(runtime.getState().events.length, 2);
  });

  it('maps Offer commercial events into Automation catalog', async () => {
    const runtime = createAutomationRuntime();
    const integrations = createOfferAutomationIntegrations(runtime);

    await integrations.emitTimelineEvent?.({
      type: 'offer.order.confirmed',
      occurredAt: '2026-08-04T10:00:00.000Z',
      orderId: 'ORD-1',
      packageId: 'starter',
      amountCzk: 14_970,
      partnerName: 'Domy s energií',
    });
    await integrations.emitTimelineEvent?.({
      type: 'offer.proforma.issued',
      occurredAt: '2026-08-04T10:01:00.000Z',
      orderId: 'ORD-1',
      proformaId: 'PF-1',
      amountCzk: 14_970,
    });
    await integrations.emitTimelineEvent?.({
      type: 'offer.payment.received',
      occurredAt: '2026-08-04T10:02:00.000Z',
      orderId: 'ORD-1',
      proformaId: 'PF-1',
      amountCzk: 14_970,
      partnerName: 'Domy s energií',
      packageId: 'starter',
    });
    await integrations.onBuilderReady?.({
      type: 'offer.builder.ready',
      occurredAt: '2026-08-04T10:03:00.000Z',
      orderId: 'ORD-1',
      partnerName: 'Domy s energií',
      packageId: 'starter',
      companyName: 'DSE s.r.o.',
    });

    const kinds = runtime.getState().events.map((event) => event.kind);
    assert.deepEqual(kinds, [
      'OfferAccepted',
      'OrderConfirmed',
      'ProformaGenerated',
      'PaymentConfirmed',
      'PilotReady',
    ]);

    assert.equal(
      mapOfferTimelineToBusinessEvents({
        type: 'offer.payment.waiting',
        occurredAt: '2026-08-04T10:01:30.000Z',
        orderId: 'ORD-1',
        variableSymbol: '123',
      }).length,
      0,
    );
  });

  it('maps Office workflow message events into Automation', async () => {
    const runtime = createAutomationRuntime();
    const bridge = createOfficeWorkflowAutomationBridge(runtime);

    await bridge.emitMessageEvent?.({
      type: 'workflow.message.received',
      messageId: 'msg-1',
      conversationId: 'conv-1',
      caseId: 'case-1',
      subject: 'Re: Pilot',
      occurredAt: '2026-08-04T12:00:00.000Z',
    });

    const mapped = mapWorkflowMessageToBusinessEvent({
      type: 'workflow.message.sent',
      messageId: 'msg-2',
      conversationId: 'conv-1',
      caseId: null,
      subject: 'Welcome',
      occurredAt: '2026-08-04T12:01:00.000Z',
    });
    assert.equal(mapped.kind, 'WorkflowMessageSent');
    assert.equal(runtime.getState().events[0]?.kind, 'WorkflowMessageReceived');
  });

  it('keeps package free of React and UI automation coupling', () => {
    const runtime = read('src/runtime/automationRuntime.ts');
    const index = read('src/index.ts');
    assert.doesNotMatch(runtime, /from ['"]react['"]/);
    assert.doesNotMatch(index, /react-dom|PlatformShell|office-studio/);
    assert.match(runtime, /createAutomationRuntime/);
    assert.match(index, /createOfferAutomationIntegrations/);
    assert.match(index, /createOfficeWorkflowAutomationBridge/);
  });
});
