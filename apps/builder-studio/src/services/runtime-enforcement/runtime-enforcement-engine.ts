import type {
  EnforcementDecision,
  EvaluateEnforcementInput,
  RuntimeEnforcementEvent,
  RuntimeEnforcementIndexEntry,
  RuntimeEnforcementPackage,
  RuntimeEnforcementValidation,
} from '../../model';
import {
  BASIC_ENFORCEMENT_RULES,
  createBasicEnforcementStrategy,
  createRuntimeEnforcementValidator,
  type EnforcementStrategy,
  type RuntimeEnforcementValidator,
} from './basic-enforcement-strategy';
import {
  createRuntimeEnforcementIndex,
  type RuntimeEnforcementIndex,
} from './runtime-enforcement-index';

export type RuntimePolicyEnforcementEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: EnforcementStrategy;
  readonly validator?: RuntimeEnforcementValidator;
  readonly index?: RuntimeEnforcementIndex;
};

/**
 * RuntimePolicyEnforcementEngine (EPIC-BLD-41).
 * Publishes Enforcement Decisions only — never executes Runtime control.
 */
export type RuntimePolicyEnforcementEngine = {
  initialize(input: EvaluateEnforcementInput): RuntimeEnforcementPackage;
  evaluate(input: EvaluateEnforcementInput): RuntimeEnforcementPackage;
  decide(packageId: string): EnforcementDecision;
  publish(packageId: string): RuntimeEnforcementPackage;
  dispose(packageId: string): RuntimeEnforcementPackage;
  getPackage(packageId: string): RuntimeEnforcementPackage | null;
  listPackages(): readonly RuntimeEnforcementPackage[];
  listDecisions(): readonly EnforcementDecision[];
  getEvents(): readonly RuntimeEnforcementEvent[];
  getIndex(): readonly RuntimeEnforcementIndexEntry[];
  validate(packageId: string): RuntimeEnforcementValidation;
};

export function createRuntimePolicyEnforcementEngine(
  options: RuntimePolicyEnforcementEngineOptions = {},
): RuntimePolicyEnforcementEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicEnforcementStrategy();
  const validator =
    options.validator ?? createRuntimeEnforcementValidator({ now });
  const index = options.index ?? createRuntimeEnforcementIndex();

  const packages = new Map<string, RuntimeEnforcementPackage>();
  const events: RuntimeEnforcementEvent[] = [];

  const emit = (
    type: RuntimeEnforcementEvent['type'],
    packageId: string,
    decisionId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-enforcement-event'),
      type,
      packageId,
      decisionId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeEnforcementPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Enforcement package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeEnforcementPackage,
  ): RuntimeEnforcementPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: EvaluateEnforcementInput,
  ): RuntimeEnforcementPackage => {
    if (!strategy.supports(input)) {
      throw new Error('Enforcement strategy does not support this input.');
    }
    const triggered = strategy.evaluate(input, BASIC_ENFORCEMENT_RULES);
    const decision = strategy.decide(input, triggered, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeEnforcementPackage = {
      id: createId('runtime-enforcement-package'),
      version: '1.0.0',
      decision,
      triggeredRules: triggered,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Enforcement ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Enforcement Decision artifact — not executed against Runtime.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'EnforcementEvaluated',
      pkg.id,
      decision.id,
      `Evaluated ${triggered.length} enforcement rule(s).`,
    );
    emit(
      'EnforcementDecisionCreated',
      pkg.id,
      decision.id,
      `Decision ${decision.status}: ${decision.recommendedAction}.`,
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

    decide(packageId) {
      return requirePackage(packageId).decision;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeEnforcementPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'EnforcementValidated',
        next.id,
        next.decision.id,
        validation.valid
          ? 'Enforcement package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid enforcement package.');
      }
      const next: RuntimeEnforcementPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Enforcement Decision (advisory only).',
        },
      };
      store(next);
      emit(
        'EnforcementPublished',
        next.id,
        next.decision.id,
        `Published enforcement package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeEnforcementPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed enforcement package (read-only archive).',
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

    listDecisions() {
      return [...packages.values()].map((item) => item.decision);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
