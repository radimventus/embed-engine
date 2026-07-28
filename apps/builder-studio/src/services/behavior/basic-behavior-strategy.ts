import type {
  BehaviorAction,
  BehaviorContext,
  BehaviorSignal,
} from '../../model';

/**
 * BehaviorStrategy (EPIC-BLD-20).
 * Pluggable deterministic strategy — proposes actions only.
 */
export type BehaviorStrategy = {
  readonly id: string;
  supports(context: BehaviorContext): boolean;
  evaluate(context: BehaviorContext): readonly BehaviorSignal[];
  propose(
    context: BehaviorContext,
    createId: (prefix: string) => string,
  ): readonly BehaviorAction[];
};

/**
 * BasicBehaviorStrategy — simple deterministic mapping from signals to actions.
 * Never mutates Story or Session.
 */
export function createBasicBehaviorStrategy(): BehaviorStrategy {
  return {
    id: 'basic-behavior-strategy',

    supports() {
      return true;
    },

    evaluate(context) {
      return context.signals;
    },

    propose(context, createId) {
      const actions: BehaviorAction[] = [];
      const latest = context.signals[0] ?? null;

      if (latest === null) {
        actions.push({
          id: createId('behavior-action'),
          type: 'Continue',
          priority: 1,
          reason: 'No signals yet — continue linear session flow.',
          target: context.currentMove,
          metadata: {
            strategyId: 'basic-behavior-strategy',
            signalId: null,
          },
        });
        return actions;
      }

      switch (latest.type) {
        case 'MoveEntered':
          actions.push({
            id: createId('behavior-action'),
            type: 'Highlight',
            priority: 2,
            reason: `Highlight current move after ${latest.type}.`,
            target: latest.payload.moveId ?? context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          actions.push({
            id: createId('behavior-action'),
            type: 'Continue',
            priority: 1,
            reason: 'Continue after move entered.',
            target: latest.payload.moveId ?? context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        case 'MoveExited':
          actions.push({
            id: createId('behavior-action'),
            type: 'Skip',
            priority: 2,
            reason: 'Move exited quickly — suggest skip readiness.',
            target: latest.payload.moveId,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        case 'PauseDetected':
          actions.push({
            id: createId('behavior-action'),
            type: 'Wait',
            priority: 3,
            reason: 'Pause detected — wait before advancing.',
            target: context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        case 'ResumeDetected':
          actions.push({
            id: createId('behavior-action'),
            type: 'Continue',
            priority: 2,
            reason: 'Resume detected — continue session.',
            target: context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        case 'Timeout':
          actions.push({
            id: createId('behavior-action'),
            type: 'Suggest',
            priority: 3,
            reason: 'Timeout — suggest next guidance.',
            target: context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        case 'UserAction':
          actions.push({
            id: createId('behavior-action'),
            type: 'Suggest',
            priority: 2,
            reason: `User action: ${latest.payload.note}`,
            target: latest.payload.moveId ?? context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
          break;
        default:
          actions.push({
            id: createId('behavior-action'),
            type: 'Continue',
            priority: 1,
            reason: 'Default continue proposal.',
            target: context.currentMove,
            metadata: {
              strategyId: 'basic-behavior-strategy',
              signalId: latest.id,
            },
          });
      }

      return actions.sort((a, b) => b.priority - a.priority);
    },
  };
}
