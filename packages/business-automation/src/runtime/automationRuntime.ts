/**
 * PT-13 / PT-16 — Automation Runtime orchestration.
 * Workflow publishes events → Runtime plans actions → ports execute adapters.
 * No UI coupling · no SMTP · no bank · no scheduler.
 */

import {
  planActionsForEvent,
  type AutomationActionId,
  type AutomationActionPlanItem,
  DEFAULT_EVENT_ACTION_BINDINGS,
} from '../domain/automationActions';
import type { BusinessEvent, BusinessEventKind } from '../domain/businessEvents';
import {
  createActionRegistry,
  type AutomationActionRegistry,
} from '../registry/actionRegistry';
import type { AutomationIntegrationPorts } from '../ports/integrationPorts';

export type AutomationDispatchRecord = {
  readonly event: BusinessEvent;
  readonly plan: readonly AutomationActionPlanItem[];
  readonly dispatchedAt: string;
};

export type AutomationRuntimeState = {
  readonly events: readonly BusinessEvent[];
  readonly dispatches: readonly AutomationDispatchRecord[];
};

export type AutomationRuntimeOptions = {
  readonly actionRegistry?: AutomationActionRegistry;
  readonly ports?: AutomationIntegrationPorts;
  readonly bindings?: Readonly<
    Partial<Record<BusinessEventKind, readonly AutomationActionId[]>>
  >;
  readonly maxHistory?: number;
};

export type AutomationRuntime = {
  readonly publish: (event: BusinessEvent) => Promise<AutomationDispatchRecord>;
  readonly getState: () => AutomationRuntimeState;
  readonly getActionRegistry: () => AutomationActionRegistry;
  readonly reset: () => void;
};

function createEmptyState(): AutomationRuntimeState {
  return { events: [], dispatches: [] };
}

function trimHistory<T>(items: readonly T[], max: number): readonly T[] {
  if (items.length <= max) return items;
  return items.slice(items.length - max);
}

export function createAutomationRuntime(
  options: AutomationRuntimeOptions = {},
): AutomationRuntime {
  const actionRegistry = options.actionRegistry ?? createActionRegistry();
  const ports = options.ports ?? {};
  const bindings = options.bindings ?? DEFAULT_EVENT_ACTION_BINDINGS;
  const maxHistory = options.maxHistory ?? 200;

  let state = createEmptyState();

  return {
    getActionRegistry: () => actionRegistry,

    getState: () => state,

    reset: () => {
      state = createEmptyState();
    },

    publish: async (event) => {
      const planned = planActionsForEvent(event.kind, bindings);
      const plan: AutomationActionPlanItem[] = [];

      for (const item of planned) {
        const handler = actionRegistry.get(item.actionId);
        if (handler === null) {
          plan.push({
            ...item,
            status: 'skipped',
            reason: 'action-not-registered',
          });
          continue;
        }

        try {
          await handler({ event, planItem: item });
          plan.push({ ...item, status: 'completed', reason: 'stub' });

          if (
            item.actionId === 'SendOfferMail' ||
            item.actionId === 'SendProformaMail' ||
            item.actionId === 'SendWelcomeMail'
          ) {
            await ports.mailSession?.notifyMailIntent?.({
              actionId: item.actionId,
              event,
            });
          }

          if (item.actionId === 'GenerateDocument') {
            await ports.documentRuntime?.generateForEvent?.(event);
          }

          if (
            item.actionId === 'NotifyOffice' ||
            item.actionId === 'CreateBuilderTask'
          ) {
            await ports.officeTasks?.createForEvent?.({
              event,
              actionId: item.actionId,
            });
          }
        } catch (error) {
          plan.push({
            ...item,
            status: 'failed',
            reason: error instanceof Error ? error.message : 'action-failed',
          });
        }
      }

      const record: AutomationDispatchRecord = {
        event,
        plan,
        dispatchedAt: new Date().toISOString(),
      };

      state = {
        events: trimHistory([...state.events, event], maxHistory),
        dispatches: trimHistory([...state.dispatches, record], maxHistory),
      };

      await ports.conversation?.notifyBusinessEvent?.(event);
      await ports.workflow?.notifyActionPlan?.({ event, plan });

      return record;
    },
  };
}
