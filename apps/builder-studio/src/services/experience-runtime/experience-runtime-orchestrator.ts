import type {
  ExperienceRuntimeEvent,
  RuntimeExecution,
  RuntimeExecutionPackage,
  RuntimeTransition,
  StartRuntimeInput,
} from '../../model';
import {
  createBasicRuntimeStrategy,
  createRuntimeValidator,
  type RuntimeStrategy,
  type RuntimeValidator,
} from './basic-runtime-strategy';
import { createRuntimeIndex, type RuntimeIndex } from './runtime-index';

const MAX_HISTORY = 40;

export type ExperienceRuntimeOrchestrator = {
  initialize(sessionId: string): string;
  start(input: StartRuntimeInput): RuntimeExecutionPackage;
  next(packageId: string): RuntimeExecutionPackage;
  previous(packageId: string): RuntimeExecutionPackage;
  jump(packageId: string, moveId: string): RuntimeExecutionPackage;
  complete(packageId: string): RuntimeExecutionPackage;
  dispose(packageId: string): RuntimeExecutionPackage;
  validate(packageId: string): RuntimeExecutionPackage;
  load(packageId: string): RuntimeExecutionPackage | null;
  preview(packageId: string): RuntimeExecutionPackage | null;
  list(): readonly RuntimeExecutionPackage[];
  getIndex(): RuntimeIndex;
  getEvents(packageId?: string): readonly ExperienceRuntimeEvent[];
  getHistory(packageId?: string): readonly ExperienceRuntimeEvent[];
};

/**
 * ExperienceRuntimeOrchestrator (EPIC-BLD-32).
 * Experience passage only — no Knowledge / AI / Personalization creation.
 */
export function createExperienceRuntimeOrchestrator(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly strategy?: RuntimeStrategy;
  readonly validator?: RuntimeValidator;
  readonly index?: RuntimeIndex;
}): ExperienceRuntimeOrchestrator {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const strategy = options?.strategy ?? createBasicRuntimeStrategy();
  const validator = options?.validator ?? createRuntimeValidator({ now });
  const index = options?.index ?? createRuntimeIndex();
  const packages = new Map<string, RuntimeExecutionPackage>();
  const moveMaps = new Map<string, readonly string[]>();
  const events: ExperienceRuntimeEvent[] = [];

  const pushEvent = (
    type: ExperienceRuntimeEvent['type'],
    packageId: string,
    executionId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('experience-runtime-event'),
      type,
      packageId,
      executionId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requirePackage = (packageId: string): RuntimeExecutionPackage => {
    const current = packages.get(packageId);
    if (current === undefined) {
      throw new Error(`RuntimeExecutionPackage not found: ${packageId}`);
    }
    return current;
  };

  const write = (next: RuntimeExecutionPackage): RuntimeExecutionPackage => {
    packages.set(next.id, next);
    index.index(next.id, next.execution);
    return next;
  };

  const applyNavigation = (
    packageId: string,
    direction: 'next' | 'previous' | 'jump',
    targetMoveId?: string | null,
  ): RuntimeExecutionPackage => {
    const current = requirePackage(packageId);
    if (current.execution.status !== 'Running') {
      throw new Error(
        `Cannot navigate execution in status ${current.execution.status}`,
      );
    }
    const moveIds = moveMaps.get(packageId) ?? [];
    const stamp = now().toISOString();
    const stepped = strategy.transition(
      current.execution,
      moveIds,
      direction,
      now,
      targetMoveId,
    );

    if (direction === 'jump' && stepped.transition.reason === 'invalid-jump-target') {
      throw new Error(
        `Invalid jump target: ${targetMoveId ?? 'null'}`,
      );
    }

    if (stepped.completed && direction === 'next') {
      const transitions = [
        ...current.execution.transitions,
        stepped.transition,
      ];
      const execution: RuntimeExecution = {
        ...current.execution,
        currentMove: stepped.currentMove,
        currentStage: 'Complete',
        status: 'Completed',
        transitions,
        completedAt: stamp,
      };
      const nextPkg: RuntimeExecutionPackage = {
        ...current,
        version: '1.0.0',
        execution,
        updatedAt: stamp,
        metadata: {
          ...current.metadata,
          status: 'Published',
        },
        validation: null,
      };
      write(nextPkg);
      pushEvent(
        'RuntimeTransitioned',
        nextPkg.id,
        execution.id,
        `Transition ${stepped.transition.from} → ${stepped.transition.to}`,
      );
      pushEvent(
        'RuntimeCompleted',
        nextPkg.id,
        execution.id,
        `Completed runtime execution ${execution.id}`,
      );
      return nextPkg;
    }

    const transitions = [...current.execution.transitions, stepped.transition];
    const execution: RuntimeExecution = {
      ...current.execution,
      currentMove: stepped.currentMove,
      currentStage: stepped.currentStage,
      transitions,
    };
    const nextPkg: RuntimeExecutionPackage = {
      ...current,
      execution,
      updatedAt: stamp,
      validation: null,
    };
    write(nextPkg);
    pushEvent(
      'RuntimeTransitioned',
      nextPkg.id,
      execution.id,
      `Transition ${stepped.transition.from} → ${stepped.transition.to} (${stepped.transition.reason})`,
    );
    return nextPkg;
  };

  return {
    initialize(sessionId) {
      return `runtime-execution-package-${sessionId}`;
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
      const bootTransition: RuntimeTransition = {
        from: null,
        to: firstMove,
        reason: 'start',
        timestamp: stamp,
        metadata: {
          notes: 'Runtime started — Boot stage.',
          stage: 'Boot',
        },
      };

      const execution: RuntimeExecution = {
        id: createId('runtime-execution'),
        sessionId: input.sessionId,
        storyId: input.storyId,
        currentStage: 'Boot',
        currentMove: firstMove,
        status: 'Running',
        transitions: [bootTransition],
        startedAt: stamp,
        completedAt: null,
        metadata: {
          title:
            input.title?.trim() ||
            `Runtime Execution ${input.sessionId}`,
          personalizedContextPackageId:
            input.personalizedContextPackageId ?? null,
          behaviorEvaluationId: input.behaviorEvaluationId ?? null,
          moduleIds: [...(input.moduleIds ?? [])],
          strategyId: strategy.id,
          notes:
            'Experience orchestration only — Story / Personalization unchanged.',
          status: 'Draft',
        },
      };

      const pkg: RuntimeExecutionPackage = {
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
        'RuntimeStarted',
        pkg.id,
        execution.id,
        `Started runtime for session ${input.sessionId}`,
      );
      pushEvent(
        'RuntimeTransitioned',
        pkg.id,
        execution.id,
        `Boot → ${firstMove}`,
      );
      return pkg;
    },

    next(packageId) {
      return applyNavigation(packageId, 'next');
    },

    previous(packageId) {
      return applyNavigation(packageId, 'previous');
    },

    jump(packageId, moveId) {
      return applyNavigation(packageId, 'jump', moveId);
    },

    complete(packageId) {
      const current = requirePackage(packageId);
      if (current.execution.status === 'Completed') {
        return current;
      }
      if (current.execution.status === 'Disposed') {
        throw new Error('Cannot complete disposed execution');
      }

      const stamp = now().toISOString();
      const transition: RuntimeTransition = {
        from: current.execution.currentMove,
        to: current.execution.currentMove,
        reason: 'complete',
        timestamp: stamp,
        metadata: {
          notes: 'Runtime completed by orchestrator.',
          stage: 'Complete',
        },
      };
      const execution: RuntimeExecution = {
        ...current.execution,
        currentStage: 'Complete',
        status: 'Completed',
        transitions: [...current.execution.transitions, transition],
        completedAt: stamp,
      };
      const nextPkg: RuntimeExecutionPackage = {
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
      write(nextPkg);
      pushEvent(
        'RuntimeTransitioned',
        nextPkg.id,
        execution.id,
        'Stage Complete',
      );
      pushEvent(
        'RuntimeCompleted',
        nextPkg.id,
        execution.id,
        `Completed runtime execution ${execution.id}`,
      );
      return nextPkg;
    },

    validate(packageId) {
      const current = requirePackage(packageId);
      const validation = validator.validate(current.execution);
      const stamp = now().toISOString();
      const nextPkg: RuntimeExecutionPackage = {
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
      write(nextPkg);
      pushEvent(
        'RuntimeValidated',
        nextPkg.id,
        nextPkg.execution.id,
        validation.valid
          ? 'Runtime execution validated'
          : `Validation failed (${validation.issues.length} issues)`,
      );
      return nextPkg;
    },

    dispose(packageId) {
      const current = requirePackage(packageId);
      const nextPkg: RuntimeExecutionPackage = {
        ...current,
        updatedAt: now().toISOString(),
        execution: {
          ...current.execution,
          status: 'Disposed',
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
      write(nextPkg);
      return nextPkg;
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
