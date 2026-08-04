/**
 * PT-13 — Integration ports for Conversation · Mail Session · Workflow.
 * Adapters plug in later (multi-mailbox · scheduler · webhooks · bank · AI).
 */

import type { BusinessEvent } from '../domain/businessEvents';
import type { AutomationActionPlanItem } from '../domain/automationActions';

/** Conversation Runtime projection — Automation never owns messages. */
export type ConversationAutomationPort = {
  readonly notifyBusinessEvent?: (
    event: BusinessEvent,
  ) => void | Promise<void>;
};

/** Mail Session — Automation queues mail actions; transport stays outside. */
export type MailSessionAutomationPort = {
  readonly notifyMailIntent?: (input: {
    readonly actionId: string;
    readonly event: BusinessEvent;
  }) => void | Promise<void>;
};

/** Workflow Runtime — publishes events into Automation; receives plans optionally. */
export type WorkflowAutomationPort = {
  readonly notifyActionPlan?: (input: {
    readonly event: BusinessEvent;
    readonly plan: readonly AutomationActionPlanItem[];
  }) => void | Promise<void>;
};

/** Document Runtime — Automation dispatches GenerateDocument only. */
export type DocumentAutomationPort = {
  readonly generateForEvent?: (event: BusinessEvent) => void | Promise<void>;
};

export type AutomationIntegrationPorts = {
  readonly conversation?: ConversationAutomationPort;
  readonly mailSession?: MailSessionAutomationPort;
  readonly workflow?: WorkflowAutomationPort;
  readonly documentRuntime?: DocumentAutomationPort;
};
