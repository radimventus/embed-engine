import type {
  CollectRecoveryReportInput,
  RecoveryReport,
  RuntimeRecoveryReportPackage,
  RuntimeRecoveryReportingEvent,
  RuntimeRecoveryReportingIndexEntry,
  RuntimeRecoveryReportingValidation,
} from '../../model';
import {
  createBasicRecoveryReportingStrategy,
  createRuntimeRecoveryReportingValidator,
  type RecoveryReportingStrategy,
  type RuntimeRecoveryReportingValidator,
} from './basic-recovery-reporting-strategy';
import {
  createRuntimeRecoveryReportingIndex,
  type RuntimeRecoveryReportingIndex,
} from './runtime-recovery-reporting-index';

export type RuntimeRecoveryReportingEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: RecoveryReportingStrategy;
  readonly validator?: RuntimeRecoveryReportingValidator;
  readonly index?: RuntimeRecoveryReportingIndex;
};

/**
 * RuntimeRecoveryReportingEngine (EPIC-BLD-46).
 * Publishes Recovery Reports only — never executes or coordinates recovery.
 */
export type RuntimeRecoveryReportingEngine = {
  initialize(input: CollectRecoveryReportInput): RuntimeRecoveryReportPackage;
  collect(input: CollectRecoveryReportInput): CollectRecoveryReportInput;
  generate(input: CollectRecoveryReportInput): RuntimeRecoveryReportPackage;
  publish(packageId: string): RuntimeRecoveryReportPackage;
  dispose(packageId: string): RuntimeRecoveryReportPackage;
  getPackage(packageId: string): RuntimeRecoveryReportPackage | null;
  listPackages(): readonly RuntimeRecoveryReportPackage[];
  listReports(): readonly RecoveryReport[];
  getEvents(): readonly RuntimeRecoveryReportingEvent[];
  getIndex(): readonly RuntimeRecoveryReportingIndexEntry[];
  validate(packageId: string): RuntimeRecoveryReportingValidation;
};

export function createRuntimeRecoveryReportingEngine(
  options: RuntimeRecoveryReportingEngineOptions = {},
): RuntimeRecoveryReportingEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicRecoveryReportingStrategy();
  const validator =
    options.validator ?? createRuntimeRecoveryReportingValidator({ now });
  const index = options.index ?? createRuntimeRecoveryReportingIndex();

  const packages = new Map<string, RuntimeRecoveryReportPackage>();
  const events: RuntimeRecoveryReportingEvent[] = [];

  const emit = (
    type: RuntimeRecoveryReportingEvent['type'],
    packageId: string,
    reportId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-recovery-reporting-event'),
      type,
      packageId,
      reportId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (
    packageId: string,
  ): RuntimeRecoveryReportPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Recovery report package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (
    pkg: RuntimeRecoveryReportPackage,
  ): RuntimeRecoveryReportPackage => {
    packages.set(pkg.id, pkg);
    const entry = index.index(pkg.id, pkg);
    emit(
      'RecoveryReportIndexed',
      pkg.id,
      pkg.report.id,
      `Indexed report ${entry.reportId} · ${entry.finalStatus}.`,
    );
    return pkg;
  };

  const buildPackage = (
    input: CollectRecoveryReportInput,
  ): RuntimeRecoveryReportPackage => {
    if (!strategy.supports(input)) {
      throw new Error(
        'Recovery reporting strategy does not support this input.',
      );
    }
    const report = strategy.generate(input, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeRecoveryReportPackage = {
      id: createId('runtime-recovery-report-package'),
      version: '1.0.0',
      report,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: report.metadata.title,
        sessionId: report.sessionId,
        notes: 'Recovery Report Package — final recovery artifact.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'RecoveryReportGenerated',
      pkg.id,
      report.id,
      `Generated report ${report.finalStatus} · ${report.executions.length} item(s).`,
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

    generate(input) {
      this.collect(input);
      return buildPackage(input);
    },

    validate(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeRecoveryReportPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      packages.set(next.id, next);
      index.index(next.id, next);
      emit(
        'RecoveryReportValidated',
        next.id,
        next.report.id,
        validation.valid
          ? 'Recovery report validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid recovery report package.');
      }
      const next: RuntimeRecoveryReportPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published Recovery Report Package.',
        },
      };
      packages.set(next.id, next);
      index.index(next.id, next);
      emit(
        'RecoveryReportPublished',
        next.id,
        next.report.id,
        `Published recovery report package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeRecoveryReportPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed recovery report package (read-only archive).',
        },
      };
      packages.set(next.id, next);
      index.index(next.id, next);
      return next;
    },

    getPackage(packageId) {
      return packages.get(packageId) ?? null;
    },

    listPackages() {
      return [...packages.values()];
    },

    listReports() {
      return [...packages.values()].map((item) => item.report);
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
