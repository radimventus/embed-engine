/**
 * PT-13 — Office host wiring for Business Automation.
 * Connects Automation Runtime to Workflow · Conversation · Mail Session.
 * Leaf Working Terminal UI must not import this module.
 */

import {
  createAutomationRuntime,
  createOfficeWorkflowAutomationBridge,
  type AutomationDispatchRecord,
  type AutomationRuntime,
  type BusinessEvent,
  type OfficeWorkflowAutomationSurface,
} from '@embed-engine/business-automation';

import {
  createPilotMailSession,
  DEFAULT_PILOT_MAILBOX_ID,
  type PilotMailTransportSession,
} from '../mail';

export type OfficeAutomationMailIntent = {
  readonly actionId: string;
  readonly event: BusinessEvent;
  readonly mailboxId: typeof DEFAULT_PILOT_MAILBOX_ID;
};

export type OfficeAutomationHostJournal = {
  readonly conversationEvents: BusinessEvent[];
  readonly mailIntents: OfficeAutomationMailIntent[];
  readonly workflowPlans: AutomationDispatchRecord[];
};

export type OfficeAutomationHost = {
  readonly runtime: AutomationRuntime;
  readonly mailSession: PilotMailTransportSession;
  readonly workflowBridge: OfficeWorkflowAutomationSurface;
  readonly journal: OfficeAutomationHostJournal;
};

let sharedHost: OfficeAutomationHost | null = null;

/**
 * Builds Office Automation host with Conversation + Mail Session ports.
 * Mail intents are queued only — no SMTP send (out of PT-13 scope).
 */
export function createOfficeAutomationHost(): OfficeAutomationHost {
  const journal: OfficeAutomationHostJournal = {
    conversationEvents: [],
    mailIntents: [],
    workflowPlans: [],
  };

  const mailSession = createPilotMailSession({
    mailboxId: DEFAULT_PILOT_MAILBOX_ID,
  });

  const runtime = createAutomationRuntime({
    ports: {
      conversation: {
        notifyBusinessEvent: (event) => {
          journal.conversationEvents.push(event);
        },
      },
      mailSession: {
        notifyMailIntent: ({ actionId, event }) => {
          journal.mailIntents.push({
            actionId,
            event,
            mailboxId: DEFAULT_PILOT_MAILBOX_ID,
          });
          void mailSession;
        },
      },
      workflow: {
        notifyActionPlan: ({ event, plan }) => {
          journal.workflowPlans.push({
            event,
            plan,
            dispatchedAt: new Date().toISOString(),
          });
        },
      },
    },
  });

  return {
    runtime,
    mailSession,
    workflowBridge: createOfficeWorkflowAutomationBridge(runtime),
    journal,
  };
}

export function getOfficeAutomationHost(): OfficeAutomationHost {
  if (sharedHost === null) {
    sharedHost = createOfficeAutomationHost();
  }
  return sharedHost;
}

export function getOfficeAutomationRuntime(): AutomationRuntime {
  return getOfficeAutomationHost().runtime;
}

export function createOfficeHostWorkflowAutomation(): OfficeWorkflowAutomationSurface {
  return getOfficeAutomationHost().workflowBridge;
}

/** Test helper — resets singleton host. */
export function resetOfficeAutomationHostForTests(): void {
  sharedHost = null;
}
