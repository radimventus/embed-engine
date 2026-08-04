/**
 * PT-13 / PT-15 — Office host wiring for Business Automation + Document Runtime.
 * Connects Automation → Document Runtime → Conversation · Mail · Timeline.
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
import {
  bindOfficeDocumentMailSession,
  generateDocumentsForBusinessEvent,
  getOfficeDocumentRuntime,
} from './officeDocumentRuntimeHost';
import type { DocumentArtifact } from '@embed-engine/document-runtime';

export type OfficeAutomationMailIntent = {
  readonly actionId: string;
  readonly event: BusinessEvent;
  readonly mailboxId: typeof DEFAULT_PILOT_MAILBOX_ID;
};

export type OfficeAutomationHostJournal = {
  readonly conversationEvents: BusinessEvent[];
  readonly mailIntents: OfficeAutomationMailIntent[];
  readonly workflowPlans: AutomationDispatchRecord[];
  readonly documents: DocumentArtifact[];
};

export type OfficeAutomationHost = {
  readonly runtime: AutomationRuntime;
  readonly mailSession: PilotMailTransportSession;
  readonly workflowBridge: OfficeWorkflowAutomationSurface;
  readonly journal: OfficeAutomationHostJournal;
};

let sharedHost: OfficeAutomationHost | null = null;

/**
 * Builds Office Automation host with Conversation + Mail + Document ports.
 */
export function createOfficeAutomationHost(): OfficeAutomationHost {
  const journal: OfficeAutomationHostJournal = {
    conversationEvents: [],
    mailIntents: [],
    workflowPlans: [],
    documents: [],
  };

  const mailSession = createPilotMailSession({
    mailboxId: DEFAULT_PILOT_MAILBOX_ID,
  });
  bindOfficeDocumentMailSession(mailSession);
  void getOfficeDocumentRuntime();

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
      documentRuntime: {
        generateForEvent: async (event) => {
          const artifacts = await generateDocumentsForBusinessEvent(event);
          journal.documents.push(...artifacts);
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
