/**
 * PT-13 — Automation action catalog (registration only).
 * Handlers are stubs until mail / Office / Builder adapters land.
 */

import type { BusinessEventKind } from './businessEvents';

export type AutomationActionId =
  | 'SendOfferMail'
  | 'SendProformaMail'
  | 'SendWelcomeMail'
  | 'NotifyOffice'
  | 'CreateBuilderTask';

export const AUTOMATION_ACTION_IDS: readonly AutomationActionId[] = Object.freeze([
  'SendOfferMail',
  'SendProformaMail',
  'SendWelcomeMail',
  'NotifyOffice',
  'CreateBuilderTask',
]);

export type AutomationActionStatus = 'queued' | 'skipped' | 'completed' | 'failed';

export type AutomationActionPlanItem = {
  readonly actionId: AutomationActionId;
  readonly eventKind: BusinessEventKind;
  readonly status: AutomationActionStatus;
  readonly reason: string | null;
};

/**
 * Declarative event → actions map.
 * Extend here for future mailboxes · schedulers · webhooks · bank · AI.
 */
export const DEFAULT_EVENT_ACTION_BINDINGS: Readonly<
  Record<BusinessEventKind, readonly AutomationActionId[]>
> = Object.freeze({
  OfferAccepted: Object.freeze(['SendOfferMail', 'NotifyOffice'] as const),
  OrderConfirmed: Object.freeze(['NotifyOffice'] as const),
  ProformaGenerated: Object.freeze(['SendProformaMail', 'NotifyOffice'] as const),
  PaymentConfirmed: Object.freeze(['NotifyOffice'] as const),
  PilotReady: Object.freeze([
    'SendWelcomeMail',
    'CreateBuilderTask',
    'NotifyOffice',
  ] as const),
  WorkflowMessageReceived: Object.freeze(['NotifyOffice'] as const),
  WorkflowMessageSent: Object.freeze([] as const),
});

export function isAutomationActionId(value: string): value is AutomationActionId {
  return (AUTOMATION_ACTION_IDS as readonly string[]).includes(value);
}

export function planActionsForEvent(
  kind: BusinessEventKind,
  bindings: Readonly<
    Partial<Record<BusinessEventKind, readonly AutomationActionId[]>>
  > = DEFAULT_EVENT_ACTION_BINDINGS,
): readonly AutomationActionPlanItem[] {
  const actionIds = bindings[kind] ?? DEFAULT_EVENT_ACTION_BINDINGS[kind] ?? [];
  return actionIds.map((actionId) => ({
    actionId,
    eventKind: kind,
    status: 'queued' as const,
    reason: null,
  }));
}
