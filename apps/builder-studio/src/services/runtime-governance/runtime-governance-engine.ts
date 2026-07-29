import type {
  EvaluateGovernanceInput,
  GovernanceEvaluation,
  RuntimeGovernanceEvent,
  RuntimeGovernanceIndexEntry,
  RuntimeGovernancePackage,
  RuntimeGovernanceValidation,
} from '../../model';
import {
  buildGovernanceEvaluation,
  createBasicGovernanceEvaluationStrategy,
  createRuntimeGovernanceValidator,
  type GovernanceEvaluationStrategy,
  type RuntimeGovernanceValidator,
} from './basic-governance-evaluation-strategy';
import {
  createRuntimeGovernanceIndex,
  type RuntimeGovernanceIndex,
} from './runtime-governance-index';

export type RuntimeGovernanceEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: GovernanceEvaluationStrategy;
  readonly validator?: RuntimeGovernanceValidator;
  readonly index?: RuntimeGovernanceIndex;
};

/**
 * RuntimeGovernanceEngine (EPIC-BLD-39).
 * Passive Production Layer — evaluate platform compliance only.
 */
export type RuntimeGovernanceEngine = {
  initialize(input: EvaluateGovernanceInput): RuntimeGovernancePackage;
  evaluate(input: EvaluateGovernanceInput): RuntimeGovernancePackage;
  validate(packageId: string): RuntimeGovernanceValidation;
  summarize(packageId: string): {
    readonly overallStatus: GovernanceEvaluation['overallStatus'];
    readonly score: number;
    readonly passedCount: number;
    readonly failedCount: number;
  };
  publish(packageId: string): RuntimeGovernancePackage;
  dispose(packageId: string): RuntimeGovernancePackage;
  getPackage(packageId: string): RuntimeGovernancePackage | null;
  listPackages(): readonly RuntimeGovernancePackage[];
  listEvaluations(): readonly GovernanceEvaluation[];
  getEvents(): readonly RuntimeGovernanceEvent[];
  getIndex(): readonly RuntimeGovernanceIndexEntry[];
};

export function createRuntimeGovernanceEngine(
  options: RuntimeGovernanceEngineOptions = {},
): RuntimeGovernanceEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicGovernanceEvaluationStrategy();
  const validator =
    options.validator ?? createRuntimeGovernanceValidator({ now });
  const index = options.index ?? createRuntimeGovernanceIndex();

  const packages = new Map<string, RuntimeGovernancePackage>();
  const events: RuntimeGovernanceEvent[] = [];

  const emit = (
    type: RuntimeGovernanceEvent['type'],
    packageId: string,
    evaluationId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-governance-event'),
      type,
      packageId,
      evaluationId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeGovernancePackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Governance package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeGovernancePackage,
  ): RuntimeGovernancePackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: EvaluateGovernanceInput,
  ): RuntimeGovernancePackage => {
    if (!strategy.supports(input)) {
      throw new Error(
        'Governance evaluation strategy does not support this input.',
      );
    }
    const result = strategy.evaluate(input, createId, now);
    const evaluation = buildGovernanceEvaluation(
      input,
      result,
      createId,
      now,
    );
    const stamp = now().toISOString();
    const pkg: RuntimeGovernancePackage = {
      id: createId('runtime-governance-package'),
      version: '1.0.0',
      evaluation,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Governance ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Read-only Runtime Governance package.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'GovernanceEvaluated',
      pkg.id,
      evaluation.id,
      `Governance ${evaluation.overallStatus} score=${evaluation.score} (passed=${evaluation.passedRules.length}, failed=${evaluation.failedRules.length}).`,
    );

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    evaluate(input) {
      return buildPackage(input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeGovernancePackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'GovernanceValidated',
        next.id,
        next.evaluation.id,
        validation.valid
          ? 'Governance package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    summarize(packageId) {
      const pkg = requirePackage(packageId);
      return {
        overallStatus: pkg.evaluation.overallStatus,
        score: pkg.evaluation.score,
        passedCount: pkg.evaluation.passedRules.length,
        failedCount: pkg.evaluation.failedRules.length,
      };
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid governance package.');
      }
      const next: RuntimeGovernancePackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published governance compliance package.',
        },
      };
      store(next);
      emit(
        'GovernancePublished',
        next.id,
        next.evaluation.id,
        `Published governance package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeGovernancePackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed governance package (read-only archive).',
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

    listEvaluations() {
      return [...packages.values()].map((item) => item.evaluation);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
