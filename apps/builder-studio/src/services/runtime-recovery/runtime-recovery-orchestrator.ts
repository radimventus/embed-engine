import type {
  BuildRecoverySequenceInput,
  RecoverySequence,
  RuntimeRecoveryEvent,
  RuntimeRecoveryIndexEntry,
  RuntimeRecoveryPackage,
  RuntimeRecoveryValidation,
} from '../../model';
import {
  createBasicRecoveryOrchestrationStrategy,
  createRuntimeRecoveryValidator,
  type RecoveryOrchestrationStrategy,
  type RuntimeRecoveryValidator,
} from './basic-recovery-orchestration-strategy';
import {
  createRuntimeRecoveryIndex,
  type RuntimeRecoveryIndex,
} from './runtime-recovery-index';

export type RuntimeRecoveryOrchestratorOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RecoveryOrchestrationStrategy;
  readonly validator?: RuntimeRecoveryValidator;
  readonly index?: RuntimeRecoveryIndex;
};

/**
 * RuntimeRecoveryOrchestrator (EPIC-BLD-43).
 * Publishes Recovery Sequences only — never executes recovery against Runtime.
 */
export type RuntimeRecoveryOrchestrator = {
  initialize(input: BuildRecoverySequenceInput): RuntimeRecoveryPackage;
  buildSequence(input: BuildRecoverySequenceInput): RuntimeRecoveryPackage;
  validate(packageId: string): RuntimeRecoveryValidation;
  publish(packageId: string): RuntimeRecoveryPackage;
  dispose(packageId: string): RuntimeRecoveryPackage;
  getPackage(packageId: string): RuntimeRecoveryPackage | null;
  listPackages(): readonly RuntimeRecoveryPackage[];
  listSequences(): readonly RecoverySequence[];
  getEvents(): readonly RuntimeRecoveryEvent[];
  getIndex(): readonly RuntimeRecoveryIndexEntry[];
};

export function createRuntimeRecoveryOrchestrator(
  options: RuntimeRecoveryOrchestratorOptions = {},
): RuntimeRecoveryOrchestrator {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicRecoveryOrchestrationStrategy();
  const validator =
    options.validator ??
    createRuntimeRecoveryValidator({ now, strategy });
  const index = options.index ?? createRuntimeRecoveryIndex();

  const packages = new Map<string, RuntimeRecoveryPackage>();
  const events: RuntimeRecoveryEvent[] = [];

  const emit = (
    type: RuntimeRecoveryEvent['type'],
    packageId: string,
    sequenceId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-recovery-event'),
      type,
      packageId,
      sequenceId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeRecoveryPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Recovery package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeRecoveryPackage): RuntimeRecoveryPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: BuildRecoverySequenceInput,
  ): RuntimeRecoveryPackage => {
    if (!strategy.supports(input)) {
      throw new Error(
        'Recovery orchestration strategy does not support this input.',
      );
    }
    const sequence = strategy.buildSequence(input, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeRecoveryPackage = {
      id: createId('runtime-recovery-package'),
      version: '1.0.0',
      sequence,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Recovery ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Recovery Sequence artifact — not executed against Runtime.',
        status: 'Draft',
        planId: input.planId ?? null,
      },
      validation: null,
    };

    emit(
      'RecoverySequenceBuilt',
      pkg.id,
      sequence.id,
      `Built ${sequence.steps.length} step(s) · risk ${sequence.riskLevel} · ${sequence.estimatedDuration}s.`,
    );
    emit(
      'RecoveryOverviewUpdated',
      pkg.id,
      sequence.id,
      `Recovery overview updated for ${sequence.metadata.recoveryStrategy ?? 'unknown'}.`,
    );

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    buildSequence(input) {
      return buildPackage(input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeRecoveryPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoverySequenceValidated',
        next.id,
        next.sequence.id,
        validation.valid
          ? 'Recovery sequence validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      emit(
        'RecoveryOverviewUpdated',
        next.id,
        next.sequence.id,
        'Recovery overview updated after validation.',
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid recovery package.');
      }
      const next: RuntimeRecoveryPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Recovery Sequence (advisory only).',
        },
      };
      store(next);
      emit(
        'RecoveryPackagePublished',
        next.id,
        next.sequence.id,
        `Published recovery package ${next.id}.`,
      );
      emit(
        'RecoveryOverviewUpdated',
        next.id,
        next.sequence.id,
        'Recovery overview updated after publish.',
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeRecoveryPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed recovery package (read-only archive).',
        },
      };
      store(next);
      emit(
        'RecoveryOverviewUpdated',
        next.id,
        next.sequence.id,
        'Recovery overview updated after dispose.',
      );
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listSequences() {
      return [...packages.values()].map((item) => item.sequence);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
