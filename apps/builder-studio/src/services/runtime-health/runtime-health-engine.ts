import type {
  InspectRuntimeInput,
  RuntimeHealthEvent,
  RuntimeHealthIndexEntry,
  RuntimeHealthPackage,
  RuntimeHealthReport,
  RuntimeHealthValidation,
} from '../../model';
import {
  buildHealthReport,
  createBasicHealthEvaluationStrategy,
  createRuntimeHealthValidator,
  type HealthEvaluationStrategy,
  type RuntimeHealthValidator,
} from './basic-health-evaluation-strategy';
import {
  createRuntimeHealthIndex,
  type RuntimeHealthIndex,
} from './runtime-health-index';

export type RuntimeHealthEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly strategy?: HealthEvaluationStrategy;
  readonly validator?: RuntimeHealthValidator;
  readonly index?: RuntimeHealthIndex;
};

/**
 * RuntimeHealthEngine (EPIC-BLD-37).
 * Passive Production Layer — diagnose only, never mutate Runtime / State / Knowledge.
 */
export type RuntimeHealthEngine = {
  initialize(input: InspectRuntimeInput): RuntimeHealthPackage;
  inspect(input: InspectRuntimeInput): RuntimeHealthPackage;
  evaluate(packageId: string): RuntimeHealthReport;
  summarize(packageId: string): {
    readonly overallHealth: RuntimeHealthReport['overallHealth'];
    readonly score: number;
    readonly warningCount: number;
    readonly errorCount: number;
  };
  publish(packageId: string): RuntimeHealthPackage;
  dispose(packageId: string): RuntimeHealthPackage;
  getPackage(packageId: string): RuntimeHealthPackage | null;
  listPackages(): readonly RuntimeHealthPackage[];
  listReports(): readonly RuntimeHealthReport[];
  getEvents(): readonly RuntimeHealthEvent[];
  getIndex(): readonly RuntimeHealthIndexEntry[];
  analyze(packageId: string): RuntimeHealthValidation;
};

export function createRuntimeHealthEngine(
  options: RuntimeHealthEngineOptions = {},
): RuntimeHealthEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const strategy = options.strategy ?? createBasicHealthEvaluationStrategy();
  const validator = options.validator ?? createRuntimeHealthValidator({ now });
  const index = options.index ?? createRuntimeHealthIndex();

  const packages = new Map<string, RuntimeHealthPackage>();
  const events: RuntimeHealthEvent[] = [];

  const emit = (
    type: RuntimeHealthEvent['type'],
    packageId: string,
    reportId: string | null,
    findingId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('runtime-health-event'),
      type,
      packageId,
      reportId,
      findingId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeHealthPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Health package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeHealthPackage): RuntimeHealthPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (input: InspectRuntimeInput): RuntimeHealthPackage => {
    if (!strategy.supports(input)) {
      throw new Error('Health evaluation strategy does not support this input.');
    }
    const evaluation = strategy.evaluate(input, createId, now);
    const report = buildHealthReport(input, evaluation, createId, now);
    const stamp = now().toISOString();
    const pkg: RuntimeHealthPackage = {
      id: createId('runtime-health-package'),
      version: '1.0.0',
      report,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Runtime Health ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Read-only Runtime Health package.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'RuntimeHealthCalculated',
      pkg.id,
      report.id,
      null,
      `Health ${report.overallHealth} score=${report.score}.`,
    );
    for (const finding of report.findings) {
      emit(
        'DiagnosticFindingCreated',
        pkg.id,
        report.id,
        finding.id,
        `${finding.severity}: ${finding.description}`,
      );
    }

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    inspect(input) {
      return buildPackage(input);
    },

    evaluate(packageId) {
      const pkg = requirePackage(packageId);
      const input: InspectRuntimeInput = {
        sessionId: pkg.report.sessionId,
        runtimeExecutionId: pkg.report.runtimeExecutionId,
        title: pkg.metadata.title,
        observabilityPackageId: pkg.report.metadata.observabilityPackageId,
        observationCount: pkg.report.findings.length > 0 ? 1 : 0,
        observabilityHealthScore: pkg.report.score,
        hasTimeline: true,
        stateConsistent: pkg.report.errors.every(
          (item) => item.category !== 'StateConsistency',
        ),
        transitionConsistent: pkg.report.errors.every(
          (item) => item.category !== 'TransitionConsistency',
        ),
        validationPassed:
          pkg.report.findings.find(
            (item) => item.category === 'ValidationSummary',
          )?.metadata.code === 'validation-ok'
            ? true
            : pkg.report.findings.find(
                  (item) => item.category === 'ValidationSummary',
                )?.metadata.code === 'validation-failed'
              ? false
              : null,
      };
      const evaluation = strategy.evaluate(input, createId, now);
      const report = buildHealthReport(input, evaluation, createId, now);
      const next: RuntimeHealthPackage = {
        ...pkg,
        report,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeHealthCalculated',
        next.id,
        report.id,
        null,
        `Re-evaluated health ${report.overallHealth}.`,
      );
      return report;
    },

    summarize(packageId) {
      const pkg = requirePackage(packageId);
      return {
        overallHealth: pkg.report.overallHealth,
        score: pkg.report.score,
        warningCount: pkg.report.warnings.length,
        errorCount: pkg.report.errors.length,
      };
    },

    analyze(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeHealthPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'RuntimeHealthValidated',
        next.id,
        next.report.id,
        null,
        validation.valid
          ? 'Health package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid health package.');
      }
      const next: RuntimeHealthPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published diagnostic health package.',
        },
      };
      store(next);
      emit(
        'RuntimeHealthPublished',
        next.id,
        next.report.id,
        null,
        `Published health package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeHealthPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed health package (read-only archive).',
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
