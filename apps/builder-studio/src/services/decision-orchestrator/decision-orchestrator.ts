import type {
  DecisionExecution,
  DecisionExecutionPackage,
  DecisionOrchestratorEvent,
  DecisionStage,
  StartExecutionInput,
} from '../../model';
import {
  createBasicDecisionFlowStrategy,
  createDecisionExecutionValidator,
  type DecisionExecutionValidator,
  type DecisionFlowStrategy,
} from './basic-decision-flow-strategy';
import {
  createDecisionExecutionIndex,
  type DecisionExecutionIndex,
} from './decision-execution-index';

const MAX_HISTORY = 40;

export type DecisionOrchestrator = {
  initialize(sessionId: string): string;
  start(input: StartExecutionInput): DecisionExecutionPackage;
  advance(packageId: string): DecisionExecutionPackage;
  transition(packageId: string): DecisionExecutionPackage;
  complete(packageId: string): DecisionExecutionPackage;
  dispose(packageId: string): DecisionExecutionPackage;
  validate(packageId: string): DecisionExecutionPackage;
  load(packageId: string): DecisionExecutionPackage | null;
  preview(packageId: string): DecisionExecutionPackage | null;
  list(): readonly DecisionExecutionPackage[];
  getIndex(): DecisionExecutionIndex;
  getEvents(packageId?: string): readonly DecisionOrchestratorEvent[];
  getHistory(packageId?: string): readonly DecisionOrchestratorEvent[];
};

/**
 * DecisionOrchestrator (EPIC-BLD-31).
 * Coordinates Decision Experience — does not create Knowledge / AI / Personalization.
 */
export function createDecisionOrchestrator(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly strategy?: DecisionFlowStrategy;
  readonly validator?: DecisionExecutionValidator;
  readonly index?: DecisionExecutionIndex;
}): DecisionOrchestrator {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const strategy =
    options?.strategy ?? createBasicDecisionFlowStrategy();
  const validator =
    options?.validator ?? createDecisionExecutionValidator({ now });
  const index = options?.index ?? createDecisionExecutionIndex();
  const packages = new Map<string, DecisionExecutionPackage>();
  const moveMaps = new Map<string, readonly string[]>();
  const events: DecisionOrchestratorEvent[] = [];

  const pushEvent = (
    type: DecisionOrchestratorEvent['type'],
    packageId: string,
    executionId: string | null,
    stageId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('decision-orchestrator-event'),
      type,
      packageId,
      executionId,
      stageId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): DecisionExecutionPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`DecisionExecutionPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: DecisionExecutionPackage): DecisionExecutionPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.execution);
    return next;
  };

  const activeStageId = (execution: DecisionExecution): string | null =>
    execution.stages.find((stage) => stage.status === 'Active')?.id ?? null;

  return {
    initialize(sessionId) {
      return `decision-execution-package-${sessionId}`;
    },

    start(input) {
      const packageId = this.initialize(input.sessionId);
      if (!strategy.supports(input)) {
        throw new Error(
          `Strategy ${strategy.id} does not support session ${input.sessionId}`,
        );
      }

      const stamp = now().toISOString();
      const firstMove = input.moveIds[0] ?? null;
      const bootStage: DecisionStage = {
        id: createId('decision-stage'),
        type: 'Boot',
        status: 'Active',
        startedAt: stamp,
        completedAt: null,
        metadata: {
          notes: 'Execution started — Boot stage.',
          moveId: firstMove,
        },
      };

      const execution: DecisionExecution = {
        id: createId('decision-execution'),
        sessionId: input.sessionId,
        storyId: input.storyId,
        currentMove: firstMove,
        state: 'Running',
        stages: [bootStage],
        startedAt: stamp,
        completedAt: null,
        metadata: {
          title:
            input.title?.trim() ||
            `Decision Execution ${input.sessionId}`,
          personalizationPackageId: input.personalizationPackageId ?? null,
          behaviorEvaluationId: input.behaviorEvaluationId ?? null,
          experienceId: input.experienceId ?? null,
          strategyId: strategy.id,
          notes:
            'Orchestration only — Story / Personalization / Behavior unchanged.',
          status: 'Draft',
        },
      };

      const pkg: DecisionExecutionPackage = {
        id: packageId,
        version: '0.1.0',
        execution,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: execution.metadata.title,
          sessionId: input.sessionId,
          storyId: input.storyId,
          notes: execution.metadata.notes,
          status: 'Draft',
        },
        validation: null,
      };

      moveMaps.set(packageId, [...input.moveIds]);
      write(pkg);
      pushEvent(
        'DecisionExecutionStarted',
        pkg.id,
        execution.id,
        bootStage.id,
        `Started execution for session ${input.sessionId}`,
      );
      pushEvent(
        'DecisionStageChanged',
        pkg.id,
        execution.id,
        bootStage.id,
        `Stage Boot → Active (move ${firstMove})`,
      );
      return pkg;
    },

    advance(packageId) {
      const current = requirePackage(packageId);
      if (current.execution.state !== 'Running') {
        throw new Error(
          `Cannot advance execution in state ${current.execution.state}`,
        );
      }
      const moveIds = moveMaps.get(packageId) ?? [];
      const stamp = now().toISOString();
      const stepped = strategy.transition(
        current.execution,
        moveIds,
        createId,
        now,
      );

      if (stepped.completed) {
        const completedExecution: DecisionExecution = {
          ...current.execution,
          currentMove: stepped.currentMove,
          state: 'Completed',
          stages: stepped.stages.map((stage) =>
            stage.status === 'Active'
              ? {
                  ...stage,
                  status: 'Done' as const,
                  completedAt: stamp,
                }
              : stage,
          ),
          completedAt: stamp,
          metadata: {
            ...current.execution.metadata,
            status: 'Draft',
          },
        };
        const next: DecisionExecutionPackage = {
          ...current,
          execution: completedExecution,
          updatedAt: stamp,
          validation: null,
        };
        write(next);
        pushEvent(
          'DecisionStageChanged',
          next.id,
          completedExecution.id,
          activeStageId(completedExecution),
          'Final stage Complete',
        );
        pushEvent(
          'DecisionExecutionCompleted',
          next.id,
          completedExecution.id,
          null,
          `Completed execution ${completedExecution.id}`,
        );
        return next;
      }

      const execution: DecisionExecution = {
        ...current.execution,
        currentMove: stepped.currentMove,
        stages: stepped.stages,
        metadata: {
          ...current.execution.metadata,
        },
      };
      const next: DecisionExecutionPackage = {
        ...current,
        execution,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'DecisionStageChanged',
        next.id,
        execution.id,
        activeStageId(execution),
        `Advanced to move ${execution.currentMove}`,
      );
      return next;
    },

    transition(packageId) {
      const current = requirePackage(packageId);
      if (current.execution.state !== 'Running') {
        throw new Error(
          `Cannot transition execution in state ${current.execution.state}`,
        );
      }
      const moveIds = moveMaps.get(packageId) ?? [];
      const stamp = now().toISOString();
      const stepped = strategy.transition(
        current.execution,
        moveIds,
        createId,
        now,
      );

      const stages = stepped.stages.map((stage, index, all) => {
        if (index !== all.length - 1 || stage.type === 'Complete') {
          return stage;
        }
        return {
          ...stage,
          type: 'Transition' as const,
          metadata: {
            ...stage.metadata,
            notes: `Explicit transition to move ${stepped.currentMove}.`,
          },
        };
      });

      if (stepped.completed) {
        const completedExecution: DecisionExecution = {
          ...current.execution,
          currentMove: stepped.currentMove,
          state: 'Completed',
          stages: stages.map((stage) =>
            stage.status === 'Active'
              ? {
                  ...stage,
                  status: 'Done' as const,
                  completedAt: stamp,
                }
              : stage,
          ),
          completedAt: stamp,
        };
        const next: DecisionExecutionPackage = {
          ...current,
          version: '1.0.0',
          execution: completedExecution,
          updatedAt: stamp,
          metadata: {
            ...current.metadata,
            status: 'Published',
          },
          validation: null,
        };
        write(next);
        pushEvent(
          'DecisionStageChanged',
          next.id,
          completedExecution.id,
          null,
          'Final transition Complete',
        );
        pushEvent(
          'DecisionExecutionCompleted',
          next.id,
          completedExecution.id,
          null,
          `Completed execution ${completedExecution.id}`,
        );
        return next;
      }

      const execution: DecisionExecution = {
        ...current.execution,
        currentMove: stepped.currentMove,
        stages,
      };
      const next: DecisionExecutionPackage = {
        ...current,
        execution,
        updatedAt: stamp,
        validation: null,
      };
      write(next);
      pushEvent(
        'DecisionStageChanged',
        next.id,
        execution.id,
        activeStageId(execution),
        `Transitioned to move ${execution.currentMove}`,
      );
      return next;
    },

    complete(packageId) {
      const current = requirePackage(packageId);
      if (current.execution.state === 'Completed') {
        return current;
      }
      if (current.execution.state === 'Disposed') {
        throw new Error('Cannot complete disposed execution');
      }

      const stamp = now().toISOString();
      const stages = current.execution.stages.map((stage) =>
        stage.status === 'Active'
          ? {
              ...stage,
              status: 'Done' as const,
              completedAt: stamp,
            }
          : stage,
      );
      const completeStage: DecisionStage = {
        id: createId('decision-stage'),
        type: 'Complete',
        status: 'Done',
        startedAt: stamp,
        completedAt: stamp,
        metadata: {
          notes: 'Execution completed by orchestrator.',
          moveId: current.execution.currentMove,
        },
      };

      const execution: DecisionExecution = {
        ...current.execution,
        state: 'Completed',
        stages: [...stages, completeStage],
        completedAt: stamp,
      };
      const next: DecisionExecutionPackage = {
        ...current,
        version: '1.0.0',
        execution,
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          status: 'Published',
        },
        validation: current.validation,
      };
      write(next);
      pushEvent(
        'DecisionStageChanged',
        next.id,
        execution.id,
        completeStage.id,
        'Stage Complete',
      );
      pushEvent(
        'DecisionExecutionCompleted',
        next.id,
        execution.id,
        completeStage.id,
        `Completed execution ${execution.id}`,
      );
      return next;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current.execution);
      const stamp = now().toISOString();
      const next: DecisionExecutionPackage = {
        ...current,
        execution: {
          ...current.execution,
          metadata: {
            ...current.execution.metadata,
            status: validation.valid
              ? ('Validated' as const)
              : current.execution.metadata.status,
          },
        },
        validation,
        updatedAt: stamp,
      };
      write(next);
      pushEvent(
        'DecisionExecutionValidated',
        next.id,
        next.execution.id,
        activeStageId(next.execution),
        validation.valid
          ? 'Decision execution validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return next;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const next: DecisionExecutionPackage = {
        ...current,
        updatedAt: now().toISOString(),
        execution: {
          ...current.execution,
          state: 'Disposed',
          metadata: {
            ...current.execution.metadata,
            status: 'Disposed',
          },
        },
        metadata: {
          ...current.metadata,
          status: 'Disposed',
        },
      };
      write(next);
      return next;
    },

    load(packageId) {
      return packages.get(packageId) ?? null;
    },

    preview(packageId) {
      return packages.get(packageId) ?? null;
    },

    list() {
      return Array.from(packages.values());
    },

    getIndex() {
      return index;
    },

    getEvents(packageId) {
      if (packageId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.packageId === packageId);
    },

    getHistory(packageId) {
      return this.getEvents(packageId);
    },
  };
}
