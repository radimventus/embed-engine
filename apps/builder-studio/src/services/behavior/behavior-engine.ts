import type {
  BehaviorAction,
  BehaviorContext,
  BehaviorEvaluation,
  BehaviorEvent,
  BehaviorSignal,
  EvaluateBehaviorInput,
} from '../../model';
import {
  createBasicBehaviorStrategy,
  type BehaviorStrategy,
} from './basic-behavior-strategy';

const MAX_HISTORY = 40;

export type BehaviorEngine = {
  initialize(sessionId: string): BehaviorContext;
  evaluate(input: EvaluateBehaviorInput): BehaviorEvaluation;
  proposeActions(sessionId: string): readonly BehaviorAction[];
  receiveSignal(signal: BehaviorSignal): BehaviorSignal;
  dispose(sessionId: string): void;
  load(sessionId: string): BehaviorEvaluation | null;
  preview(sessionId: string): BehaviorEvaluation | null;
  listSignals(sessionId?: string): readonly BehaviorSignal[];
  getEvents(sessionId?: string): readonly BehaviorEvent[];
  getHistory(sessionId?: string): readonly BehaviorEvent[];
  list(): readonly BehaviorEvaluation[];
};

/**
 * BehaviorEngine (EPIC-BLD-20).
 * Deterministic advisory layer — does not mutate Story or Runtime Session.
 */
export function createBehaviorEngine(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly strategy?: BehaviorStrategy;
}): BehaviorEngine {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const strategy = options?.strategy ?? createBasicBehaviorStrategy();
  const contexts = new Map<string, BehaviorContext>();
  const evaluations = new Map<string, BehaviorEvaluation>();
  const signalsBySession = new Map<string, BehaviorSignal[]>();
  const events: BehaviorEvent[] = [];

  const pushEvent = (
    type: BehaviorEvent['type'],
    sessionId: string,
    evaluationId: string | null,
    signalId: string | null,
    actionId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('behavior-event'),
      type,
      sessionId,
      evaluationId,
      signalId,
      actionId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const ensureContext = (
    input: EvaluateBehaviorInput,
  ): BehaviorContext => {
    const existingSignals = signalsBySession.get(input.sessionId) ?? [];
    const mergedSignals = [
      ...(input.signals ?? []),
      ...existingSignals,
    ].filter(
      (signal, index, all) =>
        all.findIndex((item) => item.id === signal.id) === index,
    );

    const context: BehaviorContext = {
      sessionId: input.sessionId,
      currentMove: input.currentMove,
      history: input.history,
      signals: mergedSignals,
      metadata: {
        title: input.title?.trim() || 'Behavior Context',
        notes:
          'Advisory context derived from Runtime Session — Story/Session unchanged.',
      },
    };
    contexts.set(input.sessionId, context);
    signalsBySession.set(input.sessionId, [...mergedSignals]);
    return context;
  };

  return {
    initialize(sessionId) {
      const stamp = now().toISOString();
      const context: BehaviorContext = {
        sessionId,
        currentMove: null,
        history: [],
        signals: signalsBySession.get(sessionId) ?? [],
        metadata: {
          title: 'Behavior Context',
          notes: `Initialized at ${stamp}`,
        },
      };
      contexts.set(sessionId, context);
      return context;
    },

    receiveSignal(signal) {
      const list = signalsBySession.get(signal.metadata.sessionId) ?? [];
      const next = [signal, ...list].slice(0, MAX_HISTORY);
      signalsBySession.set(signal.metadata.sessionId, next);

      const context = contexts.get(signal.metadata.sessionId);
      if (context !== undefined) {
        contexts.set(signal.metadata.sessionId, {
          ...context,
          signals: next,
        });
      }

      pushEvent(
        'BehaviorSignalReceived',
        signal.metadata.sessionId,
        null,
        signal.id,
        null,
        `Signal ${signal.type} from ${signal.source}`,
      );
      return signal;
    },

    evaluate(input) {
      const context = ensureContext(input);
      if (!strategy.supports(context)) {
        throw new Error(`Strategy does not support session ${input.sessionId}`);
      }

      strategy.evaluate(context);
      const actions = strategy.propose(context, createId);
      const stamp = now().toISOString();
      const evaluation: BehaviorEvaluation = {
        id: `behavior-eval-${input.sessionId}`,
        sessionId: input.sessionId,
        context,
        actions,
        strategyId: strategy.id,
        timestamps: { createdAt: stamp, updatedAt: stamp },
      };
      evaluations.set(input.sessionId, evaluation);

      pushEvent(
        'BehaviorEvaluated',
        input.sessionId,
        evaluation.id,
        null,
        null,
        `Evaluated with ${actions.length} proposed actions`,
      );
      for (const action of actions) {
        pushEvent(
          'BehaviorActionProposed',
          input.sessionId,
          evaluation.id,
          action.metadata.signalId,
          action.id,
          `Proposed ${action.type}: ${action.reason}`,
        );
      }
      return evaluation;
    },

    proposeActions(sessionId) {
      const evaluation = evaluations.get(sessionId);
      if (evaluation === undefined) {
        return [];
      }
      return evaluation.actions;
    },

    dispose(sessionId) {
      contexts.delete(sessionId);
      evaluations.delete(sessionId);
      signalsBySession.delete(sessionId);
    },

    load(sessionId) {
      return evaluations.get(sessionId) ?? null;
    },

    preview(sessionId) {
      return evaluations.get(sessionId) ?? null;
    },

    listSignals(sessionId) {
      if (sessionId === undefined) {
        return Array.from(signalsBySession.values()).flat();
      }
      return signalsBySession.get(sessionId) ?? [];
    },

    getEvents(sessionId) {
      if (sessionId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.sessionId === sessionId);
    },

    getHistory(sessionId) {
      return this.getEvents(sessionId);
    },

    list() {
      return Array.from(evaluations.values());
    },
  };
}
