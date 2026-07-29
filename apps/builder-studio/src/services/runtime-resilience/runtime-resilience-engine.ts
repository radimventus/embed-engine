import type {
  EvaluateResilienceInput,
  RecoveryPlan,
  RuntimeResilienceEvent,
  RuntimeResilienceIndexEntry,
  RuntimeResiliencePackage,
  RuntimeResilienceValidation,
} from '../../model';
import {
  createBasicRecoveryStrategy,
  createRuntimeResilienceValidator,
  type RecoveryStrategy,
  type RuntimeResilienceValidator,
} from './basic-recovery-strategy';
import {
  createRuntimeResilienceIndex,
  type RuntimeResilienceIndex,
} from './runtime-resilience-index';

export type RuntimeResilienceEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RecoveryStrategy;
  readonly validator?: RuntimeResilienceValidator;
  readonly index?: RuntimeResilienceIndex;
};

/**
 * RuntimeResilienceEngine (EPIC-BLD-42).
 * Publishes Recovery Plans only — never executes recovery against Runtime.
 */
export type RuntimeResilienceEngine = {
  initialize(input: EvaluateResilienceInput): RuntimeResiliencePackage;
  inspect(input: EvaluateResilienceInput): EvaluateResilienceInput;
  evaluate(input: EvaluateResilienceInput): RuntimeResiliencePackage;
  createRecoveryPlan(packageId: string): RecoveryPlan;
  publish(packageId: string): RuntimeResiliencePackage;
  dispose(packageId: string): RuntimeResiliencePackage;
  getPackage(packageId: string): RuntimeResiliencePackage | null;
  listPackages(): readonly RuntimeResiliencePackage[];
  listPlans(): readonly RecoveryPlan[];
  getEvents(): readonly RuntimeResilienceEvent[];
  getIndex(): readonly RuntimeResilienceIndexEntry[];
  validate(packageId: string): RuntimeResilienceValidation;
};

export function createRuntimeResilienceEngine(
  options: RuntimeResilienceEngineOptions = {},
): RuntimeResilienceEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRecoveryStrategy();
  const validator =
    options.validator ?? createRuntimeResilienceValidator({ now });
  const index = options.index ?? createRuntimeResilienceIndex();

  const packages = new Map<string, RuntimeResiliencePackage>();
  const events: RuntimeResilienceEvent[] = [];

  const emit = (
    type: RuntimeResilienceEvent['type'],
    packageId: string,
    planId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-resilience-event'),
      type,
      packageId,
      planId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeResiliencePackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Resilience package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeResiliencePackage): RuntimeResiliencePackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: EvaluateResilienceInput,
  ): RuntimeResiliencePackage => {
    if (!strategy.supports(input)) {
      throw new Error('Recovery strategy does not support this input.');
    }
    const kind = strategy.evaluate(input);
    const recoveryPlan = strategy.createPlan(input, kind, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeResiliencePackage = {
      id: createId('runtime-resilience-package'),
      version: '1.0.0',
      recoveryPlan,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Resilience ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Recovery Plan artifact — not executed against Runtime.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'RecoveryEvaluated',
      pkg.id,
      recoveryPlan.id,
      `Evaluated recovery strategy ${kind}.`,
    );
    emit(
      'RecoveryPlanCreated',
      pkg.id,
      recoveryPlan.id,
      `Plan ${kind} · ${recoveryPlan.estimatedRecoveryLevel} · ${recoveryPlan.recommendedSteps.length} step(s).`,
    );

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    inspect(input) {
      return {
        sessionId: input.sessionId,
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        title: input.title,
        healthStatus: input.healthStatus ?? null,
        healthScore: input.healthScore ?? null,
        enforcementStatus: input.enforcementStatus ?? null,
        disruptionCodes: [...(input.disruptionCodes ?? [])],
        moduleFailures: [...(input.moduleFailures ?? [])],
        hasCheckpoint: input.hasCheckpoint ?? true,
      };
    },

    evaluate(input) {
      this.inspect(input);
      return buildPackage(input);
    },

    createRecoveryPlan(packageId) {
      return requirePackage(packageId).recoveryPlan;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeResiliencePackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoveryValidated',
        next.id,
        next.recoveryPlan.id,
        validation.valid
          ? 'Resilience package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid resilience package.');
      }
      const next: RuntimeResiliencePackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Recovery Plan (advisory only).',
        },
      };
      store(next);
      emit(
        'RecoveryPublished',
        next.id,
        next.recoveryPlan.id,
        `Published resilience package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeResiliencePackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed resilience package (read-only archive).',
        },
      };
      store(next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listPlans() {
      return [...packages.values()].map((item) => item.recoveryPlan);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
