import type {
  ExecuteRecoveryInput,
  RecoveryExecution,
  RecoveryResult,
  RuntimeRecoveryExecutionEvent,
  RuntimeRecoveryExecutionIndexEntry,
  RuntimeRecoveryExecutionPackage,
  RuntimeRecoveryExecutionValidation,
} from '../../model';
import {
  createBasicRecoveryExecutionStrategy,
  createRuntimeRecoveryExecutionValidator,
  type RecoveryExecutionStrategy,
  type RuntimeRecoveryExecutionValidator,
} from './basic-recovery-execution-strategy';
import {
  createRuntimeRecoveryExecutionIndex,
  type RuntimeRecoveryExecutionIndex,
} from './runtime-recovery-execution-index';

export type RuntimeRecoveryExecutorOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RecoveryExecutionStrategy;
  readonly validator?: RuntimeRecoveryExecutionValidator;
  readonly index?: RuntimeRecoveryExecutionIndex;
};

/**
 * RuntimeRecoveryExecutor (EPIC-BLD-44).
 * Coordinates deterministic execution of a prepared Recovery Sequence.
 */
export type RuntimeRecoveryExecutor = {
  initialize(input: ExecuteRecoveryInput): RuntimeRecoveryExecutionPackage;
  execute(packageId: string): RuntimeRecoveryExecutionPackage;
  pause(packageId: string): RuntimeRecoveryExecutionPackage;
  resume(packageId: string): RuntimeRecoveryExecutionPackage;
  complete(packageId: string): RuntimeRecoveryExecutionPackage;
  dispose(packageId: string): RuntimeRecoveryExecutionPackage;
  getPackage(packageId: string): RuntimeRecoveryExecutionPackage | null;
  listPackages(): readonly RuntimeRecoveryExecutionPackage[];
  listExecutions(): readonly RecoveryExecution[];
  getEvents(): readonly RuntimeRecoveryExecutionEvent[];
  getIndex(): readonly RuntimeRecoveryExecutionIndexEntry[];
  validate(packageId: string): RuntimeRecoveryExecutionValidation;
  publish(packageId: string): RuntimeRecoveryExecutionPackage;
};

export function createRuntimeRecoveryExecutor(
  options: RuntimeRecoveryExecutorOptions = {},
): RuntimeRecoveryExecutor {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRecoveryExecutionStrategy();
  const validator =
    options.validator ?? createRuntimeRecoveryExecutionValidator({ now });
  const index = options.index ?? createRuntimeRecoveryExecutionIndex();

  const packages = new Map<string, RuntimeRecoveryExecutionPackage>();
  const events: RuntimeRecoveryExecutionEvent[] = [];
  /** Optional fail-on step configured at initialize. */
  const failOnByPackage = new Map<string, string | null>();

  const emit = (
    type: RuntimeRecoveryExecutionEvent['type'],
    packageId: string,
    executionId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-recovery-execution-event'),
      type,
      packageId,
      executionId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (
    packageId: string,
  ): RuntimeRecoveryExecutionPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Recovery execution package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildResult = (
    execution: RecoveryExecution,
    pkg: RuntimeRecoveryExecutionPackage,
  ): RecoveryResult => {
    const duration = pkg.sequenceSnapshot.steps
      .filter((step) => execution.metadata.completedStepIds.includes(step.id))
      .reduce((sum, step) => sum + step.metadata.estimatedSeconds, 0);

    let status: RecoveryResult['status'] = 'Succeeded';
    if (execution.metadata.failedStepIds.length > 0) {
      status =
        execution.metadata.completedStepIds.length > 0 ? 'Partial' : 'Failed';
    }

    return {
      id: createId('recovery-result'),
      executionId: execution.id,
      status,
      completedSteps: [...execution.metadata.completedStepIds],
      failedSteps: [...execution.metadata.failedStepIds],
      duration,
      metadata: {
        notes: 'Recovery Result artifact from coordinated sequence execution.',
        sequenceId: execution.sequenceId,
        lastStepId: execution.currentStep,
      },
    };
  };

  const advanceOneStep = (
    pkg: RuntimeRecoveryExecutionPackage,
  ): RuntimeRecoveryExecutionPackage => {
    const ordered = [...pkg.sequenceSnapshot.steps].sort(
      (a, b) => a.order - b.order,
    );
    const done = new Set(pkg.execution.metadata.completedStepIds);
    const failed = new Set(pkg.execution.metadata.failedStepIds);
    const nextStep =
      ordered.find((step) => !done.has(step.id) && !failed.has(step.id)) ??
      null;

    if (nextStep === null) {
      const execution: RecoveryExecution = {
        ...pkg.execution,
        status: failed.size > 0 ? 'FAILED' : 'COMPLETED',
        completedAt: now().toISOString(),
      };
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        execution,
        result: buildResult(execution, pkg),
        updatedAt: now().toISOString(),
      };
      return store(next);
    }

    const failOn = failOnByPackage.get(pkg.id) ?? null;
    if (failOn !== null && failOn === nextStep.id) {
      const execution: RecoveryExecution = {
        ...pkg.execution,
        status: 'FAILED',
        currentStep: nextStep.id,
        startedAt: pkg.execution.startedAt ?? now().toISOString(),
        completedAt: now().toISOString(),
        metadata: {
          ...pkg.execution.metadata,
          failedStepIds: [...failed, nextStep.id],
          notes: `Failed at step ${nextStep.id} (coordinated request).`,
        },
      };
      const nextPkg: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        execution,
        result: buildResult(execution, pkg),
        updatedAt: now().toISOString(),
      };
      return store(nextPkg);
    }

    const completedStepIds = [...done, nextStep.id];
    const remaining = ordered.filter(
      (step) =>
        !completedStepIds.includes(step.id) && !failed.has(step.id),
    );
    const terminal = remaining.length === 0;
    const execution: RecoveryExecution = {
      ...pkg.execution,
      status: terminal ? 'COMPLETED' : 'RUNNING',
      currentStep: nextStep.id,
      startedAt: pkg.execution.startedAt ?? now().toISOString(),
      completedAt: terminal ? now().toISOString() : null,
      metadata: {
        ...pkg.execution.metadata,
        completedStepIds,
        notes: terminal
          ? 'Recovery execution completed (coordinated requests only).'
          : `Advanced step ${nextStep.action} — Execution Layer request recorded.`,
      },
    };

    const next: RuntimeRecoveryExecutionPackage = {
      ...pkg,
      execution,
      result: terminal ? buildResult(execution, pkg) : null,
      updatedAt: now().toISOString(),
    };
    return store(next);
  };

  return {
    initialize(input) {
      if (!strategy.supports(input)) {
        throw new Error(
          'Recovery execution strategy does not support this input.',
        );
      }
      const stamp = now().toISOString();
      const execution: RecoveryExecution = {
        id: createId('recovery-execution'),
        runtimeExecutionId: input.sequence.runtimeExecutionId,
        sequenceId: input.sequence.id,
        status: 'READY',
        currentStep: input.sequence.steps[0]?.id ?? null,
        startedAt: null,
        completedAt: null,
        metadata: {
          title:
            input.title?.trim() || `Recovery Execution ${input.sessionId}`,
          notes: 'Ready to coordinate Execution Layer recovery requests.',
          sessionId: input.sessionId,
          totalSteps: input.sequence.steps.length,
          completedStepIds: [],
          failedStepIds: [],
        },
      };
      const pkg: RuntimeRecoveryExecutionPackage = {
        id: createId('runtime-recovery-execution-package'),
        version: '1.0.0',
        execution,
        result: null,
        sequenceSnapshot: input.sequence,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: execution.metadata.title,
          sessionId: input.sessionId,
          notes:
            'Recovery Execution Package — sequence coordinated, not owned.',
          status: 'Draft',
        },
        validation: null,
      };
      failOnByPackage.set(pkg.id, input.failOnStepId ?? null);
      return store(pkg);
    },

    execute(packageId) {
      let pkg = requirePackage(packageId);
      if (
        pkg.execution.status !== 'READY' &&
        pkg.execution.status !== 'RUNNING' &&
        pkg.execution.status !== 'PAUSED'
      ) {
        throw new Error(
          `Cannot execute recovery from status ${pkg.execution.status}.`,
        );
      }

      const wasReady = pkg.execution.status === 'READY';
      if (wasReady || pkg.execution.status === 'PAUSED') {
        pkg = store({
          ...pkg,
          execution: {
            ...pkg.execution,
            status: 'RUNNING',
            startedAt: pkg.execution.startedAt ?? now().toISOString(),
            metadata: {
              ...pkg.execution.metadata,
              notes: 'Recovery execution running — coordinating step requests.',
            },
          },
          updatedAt: now().toISOString(),
        });
        if (wasReady) {
          emit(
            'RecoveryExecutionStarted',
            pkg.id,
            pkg.execution.id,
            `Recovery execution started · ${pkg.execution.metadata.totalSteps} step(s).`,
          );
        }
      }

      // Run remaining steps to completion (deterministic batch).
      let guard = 0;
      while (
        pkg.execution.status === 'RUNNING' &&
        guard < pkg.sequenceSnapshot.steps.length + 2
      ) {
        pkg = advanceOneStep(pkg);
        guard += 1;
      }

      if (pkg.execution.status === 'FAILED') {
        emit(
          'RecoveryExecutionFailed',
          pkg.id,
          pkg.execution.id,
          `Recovery execution failed at ${pkg.execution.currentStep ?? 'unknown'}.`,
        );
      } else if (pkg.execution.status === 'COMPLETED') {
        emit(
          'RecoveryExecutionCompleted',
          pkg.id,
          pkg.execution.id,
          `Recovery execution completed · ${pkg.result?.completedSteps.length ?? 0} step(s).`,
        );
      }

      return pkg;
    },

    pause(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.execution.status !== 'RUNNING' && pkg.execution.status !== 'READY') {
        throw new Error(
          `Cannot pause recovery from status ${pkg.execution.status}.`,
        );
      }
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        execution: {
          ...pkg.execution,
          status: 'PAUSED',
          metadata: {
            ...pkg.execution.metadata,
            notes: 'Recovery execution paused — awaiting resume.',
          },
        },
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoveryExecutionPaused',
        next.id,
        next.execution.id,
        `Recovery execution paused at ${next.execution.currentStep ?? 'start'}.`,
      );
      return next;
    },

    resume(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.execution.status !== 'PAUSED') {
        throw new Error(
          `Cannot resume recovery from status ${pkg.execution.status}.`,
        );
      }
      return this.execute(packageId);
    },

    complete(packageId) {
      let pkg = requirePackage(packageId);
      if (pkg.execution.status === 'COMPLETED' && pkg.result !== null) {
        return pkg;
      }
      if (pkg.execution.status === 'FAILED') {
        return pkg;
      }
      if (pkg.execution.status === 'READY' || pkg.execution.status === 'PAUSED') {
        pkg = store({
          ...pkg,
          execution: {
            ...pkg.execution,
            status: 'RUNNING',
            startedAt: pkg.execution.startedAt ?? now().toISOString(),
          },
          updatedAt: now().toISOString(),
        });
      }
      const finalized = strategy.finalize(
        pkg.execution,
        pkg.sequenceSnapshot,
        createId,
        now,
      );
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        execution: {
          ...finalized.execution,
          id: pkg.execution.id,
        },
        result: {
          ...finalized.result,
          executionId: pkg.execution.id,
        },
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoveryExecutionCompleted',
        next.id,
        next.execution.id,
        `Recovery execution completed · ${next.result?.completedSteps.length ?? 0} step(s).`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid recovery execution package.');
      }
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Recovery Execution Package.',
        },
      };
      store(next);
      emit(
        'RecoveryExecutionPublished',
        next.id,
        next.execution.id,
        `Published recovery execution package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeRecoveryExecutionPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed recovery execution package (read-only archive).',
        },
      };
      store(next);
      failOnByPackage.delete(packageId);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listExecutions() {
      return [...packages.values()].map((item) => item.execution);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
