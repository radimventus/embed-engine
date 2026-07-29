import type {
  CompatibilityEvaluation,
  CompatibilityRule,
  EvaluateCompatibilityInput,
  InitializeCompatibilityInput,
  RegisterCompatibilityRuleInput,
  RuntimeCompatibilityEvent,
  RuntimeCompatibilityIndexEntry,
  RuntimeCompatibilityPackage,
  RuntimeCompatibilityValidation,
} from '../../model';
import {
  buildInitialMatrix,
  computeOverallStatus,
  createBasicRuntimeCompatibilityStrategy,
  createRuleFromInput,
  createRuntimeCompatibilityValidator,
  type RuntimeCompatibilityStrategy,
  type RuntimeCompatibilityValidator,
} from './basic-runtime-compatibility-strategy';
import {
  createRuntimeCompatibilityIndex,
  type RuntimeCompatibilityIndex,
} from './runtime-compatibility-index';

export type RuntimeCompatibilityManagerOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RuntimeCompatibilityStrategy;
  readonly validator?: RuntimeCompatibilityValidator;
  readonly index?: RuntimeCompatibilityIndex;
};

/**
 * RuntimeCompatibilityManager (EPIC-BLD-52).
 * Version compatibility evaluation only — no Runtime/Manifest/API mutation.
 */
export type RuntimeCompatibilityManager = {
  initialize(input: InitializeCompatibilityInput): RuntimeCompatibilityPackage;
  register(
    packageId: string,
    input: RegisterCompatibilityRuleInput,
  ): RuntimeCompatibilityPackage;
  evaluate(
    packageId: string,
    input: EvaluateCompatibilityInput,
  ): CompatibilityEvaluation;
  publish(packageId: string): RuntimeCompatibilityPackage;
  dispose(packageId: string): RuntimeCompatibilityPackage;
  getPackage(packageId: string): RuntimeCompatibilityPackage | null;
  listPackages(): readonly RuntimeCompatibilityPackage[];
  listRules(packageId?: string): readonly CompatibilityRule[];
  find(
    packageId: string,
    sourceVersion: string,
  ): readonly CompatibilityRule[];
  getEvents(): readonly RuntimeCompatibilityEvent[];
  getIndex(): readonly RuntimeCompatibilityIndexEntry[];
  validate(packageId: string): RuntimeCompatibilityValidation;
};

export function createRuntimeCompatibilityManager(
  options: RuntimeCompatibilityManagerOptions = {},
): RuntimeCompatibilityManager {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicRuntimeCompatibilityStrategy();
  const validator =
    options.validator ?? createRuntimeCompatibilityValidator({ now });
  const index = options.index ?? createRuntimeCompatibilityIndex();

  const packages = new Map<string, RuntimeCompatibilityPackage>();
  const events: RuntimeCompatibilityEvent[] = [];

  const emit = (
    type: RuntimeCompatibilityEvent['type'],
    packageId: string,
    matrixId: string | null,
    ruleId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('compatibility-event'),
      type,
      packageId,
      matrixId,
      ruleId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (
    packageId: string,
  ): RuntimeCompatibilityPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Compatibility package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeCompatibilityPackage,
  ): RuntimeCompatibilityPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const registerInto = (
    packageId: string,
    input: RegisterCompatibilityRuleInput,
  ): RuntimeCompatibilityPackage => {
    const pkg = requirePackage(packageId);
    if (pkg.metadata.status === 'Disposed') {
      throw new Error('Cannot register into disposed compatibility package.');
    }
    if (!strategy.supports(input)) {
      throw new Error(
        'Compatibility strategy does not support this rule input.',
      );
    }
    const rule = createRuleFromInput(input, createId);
    const withoutDup = pkg.matrix.rules.filter(
      (item) =>
        !(
          item.sourceVersion === rule.sourceVersion &&
          item.targetVersion === rule.targetVersion &&
          item.metadata.dimension === rule.metadata.dimension
        ),
    );
    const rules = [...withoutDup, rule];
    const next: RuntimeCompatibilityPackage = {
      ...pkg,
      updatedAt: now().toISOString(),
      matrix: {
        ...pkg.matrix,
        rules,
        metadata: {
          ...pkg.matrix.metadata,
          overallStatus: computeOverallStatus(rules),
        },
      },
      validation: null,
    };
    store(next);
    emit(
      'CompatibilityRegistered',
      next.id,
      next.matrix.id,
      rule.id,
      `Registered rule ${rule.sourceVersion} → ${rule.targetVersion} (${rule.status}).`,
    );
    return next;
  };

  return {
    initialize(input) {
      if (!input.sessionId.trim()) {
        throw new Error('Compatibility manager requires sessionId.');
      }
      const stamp = now().toISOString();
      const matrix = buildInitialMatrix(input, createId);
      const pkg: RuntimeCompatibilityPackage = {
        id: createId('runtime-compatibility-package'),
        version: '1.0.0',
        matrix,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: matrix.metadata.title,
          sessionId: matrix.metadata.sessionId,
          notes: 'Runtime Compatibility package — evaluation only.',
          status: 'Draft',
        },
        validation: null,
      };
      let current = store(pkg);
      for (const rule of input.rules ?? []) {
        current = registerInto(current.id, rule);
      }
      return current;
    },

    register(packageId, input) {
      return registerInto(packageId, input);
    },

    evaluate(packageId, input) {
      const pkg = requirePackage(packageId);
      const evaluation = strategy.evaluate(
        pkg.matrix,
        input,
        createId,
        now,
      );
      emit(
        'CompatibilityEvaluated',
        pkg.id,
        pkg.matrix.id,
        evaluation.matchedRuleId,
        `Evaluated ${evaluation.sourceVersion} → ${evaluation.targetVersion}: ${evaluation.status}.`,
      );
      return evaluation;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeCompatibilityPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'CompatibilityValidated',
        next.id,
        next.matrix.id,
        null,
        validation.valid
          ? 'Compatibility package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid compatibility package.');
      }
      const published = strategy.publish(
        {
          ...pkg,
          validation,
        },
        now,
      );
      store(published);
      emit(
        'CompatibilityPublished',
        published.id,
        published.matrix.id,
        null,
        `Published compatibility package ${published.id}.`,
      );
      return published;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeCompatibilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed compatibility package (read-only archive).',
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

    listRules(packageId) {
      if (packageId === undefined) {
        return [...packages.values()].flatMap((item) => item.matrix.rules);
      }
      return requirePackage(packageId).matrix.rules;
    },

    find(packageId, sourceVersion) {
      return requirePackage(packageId).matrix.rules.filter(
        (rule) => rule.sourceVersion === sourceVersion,
      );
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
