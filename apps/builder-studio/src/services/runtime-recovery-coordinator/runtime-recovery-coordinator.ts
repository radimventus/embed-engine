import type {
  RecoverySession,
  RuntimeRecoveryCoordinatorEvent,
  RuntimeRecoveryCoordinatorIndexEntry,
  RuntimeRecoveryCoordinatorValidation,
  RuntimeRecoverySummaryPackage,
  StartRecoverySessionInput,
  TrackRecoveryProgressInput,
} from '../../model';
import {
  createBasicRecoveryCoordinationStrategy,
  createRuntimeRecoveryCoordinatorValidator,
  type RecoveryCoordinationStrategy,
  type RuntimeRecoveryCoordinatorValidator,
} from './basic-recovery-coordination-strategy';
import {
  createRuntimeRecoveryCoordinatorIndex,
  type RuntimeRecoveryCoordinatorIndex,
} from './runtime-recovery-coordinator-index';

export type RuntimeRecoveryCoordinatorOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RecoveryCoordinationStrategy;
  readonly validator?: RuntimeRecoveryCoordinatorValidator;
  readonly index?: RuntimeRecoveryCoordinatorIndex;
};

/**
 * RuntimeRecoveryCoordinator (EPIC-BLD-45).
 * Coordinates Recovery Session lifecycle — never executes recovery steps.
 */
export type RuntimeRecoveryCoordinator = {
  initialize(input: StartRecoverySessionInput): RuntimeRecoverySummaryPackage;
  startRecovery(packageId: string): RuntimeRecoverySummaryPackage;
  trackProgress(
    input: TrackRecoveryProgressInput,
  ): RuntimeRecoverySummaryPackage;
  completeRecovery(packageId: string): RuntimeRecoverySummaryPackage;
  publish(packageId: string): RuntimeRecoverySummaryPackage;
  dispose(packageId: string): RuntimeRecoverySummaryPackage;
  getPackage(packageId: string): RuntimeRecoverySummaryPackage | null;
  listPackages(): readonly RuntimeRecoverySummaryPackage[];
  listSessions(): readonly RecoverySession[];
  getEvents(): readonly RuntimeRecoveryCoordinatorEvent[];
  getIndex(): readonly RuntimeRecoveryCoordinatorIndexEntry[];
  validate(packageId: string): RuntimeRecoveryCoordinatorValidation;
};

export function createRuntimeRecoveryCoordinator(
  options: RuntimeRecoveryCoordinatorOptions = {},
): RuntimeRecoveryCoordinator {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicRecoveryCoordinationStrategy();
  const validator =
    options.validator ?? createRuntimeRecoveryCoordinatorValidator({ now });
  const index = options.index ?? createRuntimeRecoveryCoordinatorIndex();

  const packages = new Map<string, RuntimeRecoverySummaryPackage>();
  const events: RuntimeRecoveryCoordinatorEvent[] = [];

  const emit = (
    type: RuntimeRecoveryCoordinatorEvent['type'],
    packageId: string,
    recoverySessionId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-recovery-coordinator-event'),
      type,
      packageId,
      recoverySessionId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (
    packageId: string,
  ): RuntimeRecoverySummaryPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Recovery summary package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeRecoverySummaryPackage,
  ): RuntimeRecoverySummaryPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  return {
    initialize(input) {
      if (!strategy.supports(input)) {
        throw new Error(
          'Recovery coordination strategy does not support this input.',
        );
      }
      const stamp = now().toISOString();
      const session: RecoverySession = {
        id: createId('recovery-session'),
        runtimeExecutionId: input.runtimeExecutionId ?? null,
        status: 'CREATED',
        executions: [...(input.executions ?? [])],
        startedAt: null,
        completedAt: null,
        metadata: {
          title:
            input.title?.trim() || `Recovery Session ${input.sessionId}`,
          notes: 'Recovery Session created — awaiting start.',
          sessionId: input.sessionId,
          progressPercent: 0,
        },
      };
      const pkg: RuntimeRecoverySummaryPackage = {
        id: createId('runtime-recovery-summary-package'),
        version: '1.0.0',
        session,
        summary: null,
        createdAt: stamp,
        updatedAt: stamp,
        metadata: {
          title: session.metadata.title,
          sessionId: input.sessionId,
          notes: 'Recovery Summary Package — coordination artifact only.',
          status: 'Draft',
        },
        validation: null,
      };
      return store(pkg);
    },

    startRecovery(packageId) {
      const pkg = requirePackage(packageId);
      if (pkg.session.status !== 'CREATED' && pkg.session.status !== 'RUNNING') {
        throw new Error(
          `Cannot start recovery from status ${pkg.session.status}.`,
        );
      }
      const coordinated = strategy.coordinate(
        {
          ...pkg.session,
          status: 'RUNNING',
          startedAt: pkg.session.startedAt ?? now().toISOString(),
          metadata: {
            ...pkg.session.metadata,
            notes: 'Recovery Session running — tracking executions.',
          },
        },
        pkg.session.executions,
        now,
      );
      const next: RuntimeRecoverySummaryPackage = {
        ...pkg,
        session: coordinated,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoverySessionStarted',
        next.id,
        next.session.id,
        `Recovery session started · ${next.session.executions.length} execution(s).`,
      );
      emit(
        'RecoveryProgressUpdated',
        next.id,
        next.session.id,
        `Progress ${next.session.metadata.progressPercent}%.`,
      );
      return next;
    },

    trackProgress(input) {
      const pkg = requirePackage(input.packageId);
      if (
        pkg.session.status === 'COMPLETED' ||
        pkg.session.status === 'FAILED' ||
        pkg.session.status === 'CANCELLED'
      ) {
        throw new Error(
          `Cannot track progress from status ${pkg.session.status}.`,
        );
      }
      const coordinated = strategy.coordinate(
        {
          ...pkg.session,
          status:
            pkg.session.status === 'CREATED' ? 'RUNNING' : pkg.session.status,
          startedAt: pkg.session.startedAt ?? now().toISOString(),
        },
        input.executions,
        now,
      );
      const next: RuntimeRecoverySummaryPackage = {
        ...pkg,
        session: coordinated,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoveryProgressUpdated',
        next.id,
        next.session.id,
        `Progress ${next.session.metadata.progressPercent}% · ${next.session.executions.length} execution(s).`,
      );
      return next;
    },

    completeRecovery(packageId) {
      const pkg = requirePackage(packageId);
      const finalized = strategy.finalize(pkg.session, createId, now);
      const next: RuntimeRecoverySummaryPackage = {
        ...pkg,
        session: finalized.session,
        summary: finalized.summary,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RecoveryCompleted',
        next.id,
        next.session.id,
        `Recovery session ${next.session.status} · summary ${next.summary?.id ?? '—'}.`,
      );
      return next;
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeRecoverySummaryPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      let current = pkg;
      if (current.summary === null) {
        current = this.completeRecovery(packageId);
      }
      const validation =
        current.validation ?? validator.validate(current);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid recovery summary package.');
      }
      const next: RuntimeRecoverySummaryPackage = {
        ...current,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...current.metadata,
          status: 'Published',
          notes: 'Published Recovery Summary Package.',
        },
      };
      store(next);
      emit(
        'RecoverySummaryPublished',
        next.id,
        next.session.id,
        `Published recovery summary package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeRecoverySummaryPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed recovery summary package (read-only archive).',
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

    listSessions() {
      return [...packages.values()].map((item) => item.session);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
