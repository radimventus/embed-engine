/**
 * PT-13 / PT-15 / PT-16 — Office host for Business Automation orchestration.
 * Event → Document · Mail · Conversation · Timeline · Office Task · Workflow sync.
 */

import {
  createAutomationRuntime,
  createOfficeWorkflowAutomationBridge,
  type AutomationDispatchRecord,
  type AutomationRuntime,
  type BusinessEvent,
  type OfficeWorkflowAutomationSurface,
} from '@embed-engine/business-automation';
import type { DocumentArtifact } from '@embed-engine/document-runtime';

import {
  createPilotMailSession,
  DEFAULT_PILOT_MAILBOX_ID,
  type PilotMailTransportSession,
} from '../mail';
import { mapToConversation } from '../mail/conversationMapping';
import {
  getConversationMailStore,
  ingestStoreMessage,
} from '../mail/conversationMailStore';
import {
  applyBusinessEventToWorkflow,
} from './commercialWorkflowSync';
import { appendAutomationTimelineEvent } from './officeAutomationTimelineJournal';
import {
  bindOfficeDocumentMailSession,
  generateDocumentsForBusinessEvent,
  getOfficeDocumentRuntime,
} from './officeDocumentRuntimeHost';
import type { OfficeTask } from './officeTaskModel';
import {
  createOfficeTasksForEvent,
  resolveProjectIdFromEvent,
} from './officeTaskRegistry';

export type OfficeAutomationMailIntent = {
  readonly actionId: string;
  readonly event: BusinessEvent;
  readonly mailboxId: typeof DEFAULT_PILOT_MAILBOX_ID;
};

export type OfficeAutomationMailFailure = {
  readonly actionId: string;
  readonly event: BusinessEvent;
  readonly reason: string;
};

export type OfficeAutomationHostJournal = {
  readonly conversationEvents: BusinessEvent[];
  readonly mailIntents: OfficeAutomationMailIntent[];
  readonly mailFailures: OfficeAutomationMailFailure[];
  readonly workflowPlans: AutomationDispatchRecord[];
  readonly documents: DocumentArtifact[];
  readonly documentFailures: string[];
  readonly officeTasks: OfficeTask[];
};

export type OfficeAutomationHost = {
  readonly runtime: AutomationRuntime;
  readonly mailSession: PilotMailTransportSession;
  readonly workflowBridge: OfficeWorkflowAutomationSurface;
  readonly journal: OfficeAutomationHostJournal;
};

export type OfficeAutomationHostOptions = {
  /** Optional mail session (failure-scenario / operational injection). */
  readonly mailSession?: PilotMailTransportSession;
};

let sharedHost: OfficeAutomationHost | null = null;

function mailSubjectForAction(actionId: string, event: BusinessEvent): string {
  const partner = String(event.payload.partnerName ?? 'partner');
  switch (actionId) {
    case 'SendOfferMail':
      return `Nabídka · ${partner}`;
    case 'SendProformaMail':
      return `Proforma · ${partner}`;
    case 'SendWelcomeMail':
      return `Vítejte · ${partner}`;
    default:
      return `CONIS · ${event.kind}`;
  }
}

/**
 * Builds Office Automation host with full commercial orchestration ports.
 * Mail / document transport failures are journaled — orchestration stays consistent.
 */
export function createOfficeAutomationHost(
  options: OfficeAutomationHostOptions = {},
): OfficeAutomationHost {
  const journal: OfficeAutomationHostJournal = {
    conversationEvents: [],
    mailIntents: [],
    mailFailures: [],
    workflowPlans: [],
    documents: [],
    documentFailures: [],
    officeTasks: [],
  };

  const mailSession =
    options.mailSession ??
    createPilotMailSession({
      mailboxId: DEFAULT_PILOT_MAILBOX_ID,
    });
  bindOfficeDocumentMailSession(mailSession);
  void getOfficeDocumentRuntime();

  const runtime = createAutomationRuntime({
    ports: {
      conversation: {
        notifyBusinessEvent: (event) => {
          journal.conversationEvents.push(event);
          const projectId = resolveProjectIdFromEvent(event);
          if (projectId.length === 0) return;

          const store = getConversationMailStore();
          const toEmail =
            typeof event.payload.contactEmail === 'string'
              ? event.payload.contactEmail
              : 'partner@example.com';
          const conversation = mapToConversation(
            {
              mailboxId: DEFAULT_PILOT_MAILBOX_ID,
              fromEmail: 'kontakt@conis.cz',
              toEmail,
              subject: `Business Event · ${event.kind}`,
              threadId: `<ba-${event.id}@conis.cz>`,
              createdAt: event.occurredAt,
              caseId: projectId,
            },
            store,
          );
          ingestStoreMessage(
            {
              id: `ba-msg-${event.id}`,
              direction: 'outgoing',
              subject: `Business Event · ${event.kind}`,
              body: `Automation zpracovala událost ${event.kind} pro projekt ${projectId}.`,
              messageId: `<ba-${event.id}@conis.cz>`,
              threadId: `<ba-thread-${projectId}@conis.cz>`,
              mailboxId: conversation.mailboxId,
              conversationId: conversation.id,
              origin: 'SYSTEM',
              fromEmail: 'kontakt@conis.cz',
              toEmail,
              createdAt: event.occurredAt,
            },
            store,
          );

          appendAutomationTimelineEvent({
            id: `tl-ba-${event.id}`,
            caseId: projectId,
            kind:
              event.kind === 'OrderConfirmed'
                ? 'order.confirmed'
                : event.kind === 'PaymentConfirmed'
                  ? 'payment.received'
                  : event.kind === 'PilotReady'
                    ? 'builder.ready'
                    : 'note.added',
            title: event.kind,
            summary: `Automation · ${event.kind}`,
            detail: `eventId=${event.id}\nsource=${event.source}`,
            occurredAt: event.occurredAt,
          });
        },
      },
      mailSession: {
        notifyMailIntent: async ({ actionId, event }) => {
          journal.mailIntents.push({
            actionId,
            event,
            mailboxId: DEFAULT_PILOT_MAILBOX_ID,
          });
          const projectId = resolveProjectIdFromEvent(event);
          const toEmail =
            typeof event.payload.contactEmail === 'string'
              ? event.payload.contactEmail
              : null;
          if (toEmail === null || toEmail.length === 0) return;

          try {
            await mailSession.sendSystemMail({
              mailboxId: DEFAULT_PILOT_MAILBOX_ID,
              toEmail,
              subject: mailSubjectForAction(actionId, event),
              body: `Automatická zpráva (${actionId}) pro ${event.kind}.`,
              caseId: projectId.length > 0 ? projectId : null,
              origin: 'SYSTEM',
            });
          } catch (error) {
            journal.mailFailures.push({
              actionId,
              event,
              reason:
                error instanceof Error ? error.message : 'mail-send-failed',
            });
          }
        },
      },
      workflow: {
        notifyActionPlan: ({ event, plan }) => {
          journal.workflowPlans.push({
            event,
            plan,
            dispatchedAt: new Date().toISOString(),
          });
          const sync = applyBusinessEventToWorkflow(event);
          if (sync.projectId.length > 0 && sync.status !== null) {
            appendAutomationTimelineEvent({
              id: `tl-wf-${event.id}`,
              caseId: sync.projectId,
              kind: 'workflow.synced',
              title: 'Workflow Synced',
              summary: `Stav → ${sync.status}`,
              detail: `event=${event.kind}\nstatus=${sync.status}`,
              occurredAt: event.occurredAt,
            });
          }
        },
      },
      documentRuntime: {
        generateForEvent: async (event) => {
          try {
            const artifacts = await generateDocumentsForBusinessEvent(event);
            journal.documents.push(...artifacts);
          } catch (error) {
            journal.documentFailures.push(
              error instanceof Error ? error.message : 'document-generate-failed',
            );
          }
        },
      },
      officeTasks: {
        createForEvent: ({ event, actionId }) => {
          const created = createOfficeTasksForEvent({ event, actionId });
          journal.officeTasks.push(...created);
          for (const task of created) {
            appendAutomationTimelineEvent({
              id: `tl-task-${task.id}`,
              caseId: task.projectId,
              kind: 'office.task',
              title: task.label,
              summary: `${task.kind} · ${task.status}`,
              detail: `taskId=${task.id}\nsource=${task.sourceEventKind}`,
              occurredAt: task.createdAt,
            });
          }
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
