import type {
  CollectOperationsInput,
  OperationsSnapshot,
  RuntimeOperationsEvent,
  RuntimeOperationsIndexEntry,
  RuntimeOperationsPackage,
  RuntimeOperationsValidation,
} from '../../model';
import {
  createBasicDashboardAggregationStrategy,
  createRuntimeOperationsValidator,
  type DashboardAggregationStrategy,
  type RuntimeOperationsValidator,
} from './basic-dashboard-aggregation-strategy';
import {
  createRuntimeOperationsIndex,
  type RuntimeOperationsIndex,
} from './runtime-operations-index';

export type RuntimeOperationsDashboardOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: DashboardAggregationStrategy;
  readonly validator?: RuntimeOperationsValidator;
  readonly index?: RuntimeOperationsIndex;
};

/**
 * RuntimeOperationsDashboard (EPIC-BLD-47).
 * Projection-only aggregation of published Production Layer artifacts.
 */
export type RuntimeOperationsDashboard = {
  initialize(input: CollectOperationsInput): RuntimeOperationsPackage;
  collect(input: CollectOperationsInput): CollectOperationsInput;
  refresh(input: CollectOperationsInput): RuntimeOperationsPackage;
  publish(packageId: string): RuntimeOperationsPackage;
  dispose(packageId: string): RuntimeOperationsPackage;
  getPackage(packageId: string): RuntimeOperationsPackage | null;
  listPackages(): readonly RuntimeOperationsPackage[];
  listSnapshots(): readonly OperationsSnapshot[];
  getEvents(): readonly RuntimeOperationsEvent[];
  getIndex(): readonly RuntimeOperationsIndexEntry[];
  validate(packageId: string): RuntimeOperationsValidation;
};

export function createRuntimeOperationsDashboard(
  options: RuntimeOperationsDashboardOptions = {},
): RuntimeOperationsDashboard {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy =
    options.strategy ?? createBasicDashboardAggregationStrategy();
  const validator =
    options.validator ?? createRuntimeOperationsValidator({ now });
  const index = options.index ?? createRuntimeOperationsIndex();

  const packages = new Map<string, RuntimeOperationsPackage>();
  const events: RuntimeOperationsEvent[] = [];

  const emit = (
    type: RuntimeOperationsEvent['type'],
    packageId: string,
    snapshotId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-operations-event'),
      type,
      packageId,
      snapshotId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeOperationsPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Operations package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeOperationsPackage): RuntimeOperationsPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: CollectOperationsInput,
  ): RuntimeOperationsPackage => {
    if (!strategy.supports(input)) {
      throw new Error(
        'Dashboard aggregation strategy does not support this input.',
      );
    }
    const collected = strategy.collect(input);
    const snapshot = strategy.aggregate(collected, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeOperationsPackage = {
      id: createId('runtime-operations-package'),
      version: '1.0.0',
      snapshot,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: snapshot.metadata.title,
        sessionId: snapshot.metadata.sessionId,
        notes: 'Operations Dashboard package — projection only.',
        status: 'Draft',
      },
      validation: null,
    };
    emit(
      'OperationsCollected',
      pkg.id,
      snapshot.id,
      `Collected operations signals for ${collected.sessionId}.`,
    );
    emit(
      'OperationsAggregated',
      pkg.id,
      snapshot.id,
      `Aggregated snapshot ${snapshot.id}.`,
    );
    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    collect(input) {
      return strategy.collect(input);
    },

    refresh(input) {
      this.collect(input);
      return buildPackage(input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeOperationsPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'OperationsValidated',
        next.id,
        next.snapshot.id,
        validation.valid
          ? 'Operations package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid operations package.');
      }
      const next: RuntimeOperationsPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Operations Snapshot (projection only).',
        },
      };
      store(next);
      emit(
        'OperationsPublished',
        next.id,
        next.snapshot.id,
        `Published operations package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeOperationsPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed operations package (read-only archive).',
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

    listSnapshots() {
      return [...packages.values()].map((item) => item.snapshot);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
