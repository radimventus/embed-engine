/**
 * PT-13 — Action Registry (stubs only — no transport / CRM logic).
 */

import type { BusinessEvent } from '../domain/businessEvents';
import {
  AUTOMATION_ACTION_IDS,
  type AutomationActionId,
  type AutomationActionPlanItem,
} from '../domain/automationActions';

export type AutomationActionContext = {
  readonly event: BusinessEvent;
  readonly planItem: AutomationActionPlanItem;
};

/**
 * Registered handler — default stubs record intent only.
 * Future: SendOfferMail → Mail Session · CreateBuilderTask → Builder API.
 */
export type AutomationActionHandler = (
  context: AutomationActionContext,
) => void | Promise<void>;

export type AutomationActionRegistry = {
  readonly list: () => readonly AutomationActionId[];
  readonly has: (actionId: AutomationActionId) => boolean;
  readonly get: (actionId: AutomationActionId) => AutomationActionHandler | null;
  readonly register: (
    actionId: AutomationActionId,
    handler: AutomationActionHandler,
  ) => void;
  readonly unregister: (actionId: AutomationActionId) => void;
};

export function createStubActionHandler(
  actionId: AutomationActionId,
): AutomationActionHandler {
  return () => {
    void actionId;
    // Intentionally empty — PT-13 registers actions without executing mail/CRM.
  };
}

export function createActionRegistry(
  initial?: Partial<Record<AutomationActionId, AutomationActionHandler>>,
): AutomationActionRegistry {
  const handlers = new Map<AutomationActionId, AutomationActionHandler>();

  for (const actionId of AUTOMATION_ACTION_IDS) {
    handlers.set(actionId, initial?.[actionId] ?? createStubActionHandler(actionId));
  }

  return {
    list: () => AUTOMATION_ACTION_IDS,
    has: (actionId) => handlers.has(actionId),
    get: (actionId) => handlers.get(actionId) ?? null,
    register: (actionId, handler) => {
      handlers.set(actionId, handler);
    },
    unregister: (actionId) => {
      handlers.set(actionId, createStubActionHandler(actionId));
    },
  };
}
