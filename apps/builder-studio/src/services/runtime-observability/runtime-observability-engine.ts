import type {
  CollectRuntimeInput,
  RuntimeMetrics,
  RuntimeObservabilityEvent,
  RuntimeObservabilityIndexEntry,
  RuntimeObservabilityPackage,
  RuntimeObservabilityValidation,
} from '../../model';
import {
  aggregateMetrics,
  buildTimeline,
  createBasicObservationCollector,
  createRuntimeObservabilityValidator,
  type ObservationCollector,
  type RuntimeObservabilityValidator,
} from './basic-observation-collector';
import {
  createRuntimeObservabilityIndex,
  type RuntimeObservabilityIndex,
} from './runtime-observability-index';

export type RuntimeObservabilityEngineOptions = {
  readonly createId?: (prefix: string) => string;
  readonly now?: () => Date;
  readonly collector?: ObservationCollector;
  readonly validator?: RuntimeObservabilityValidator;
  readonly index?: RuntimeObservabilityIndex;
};

/**
 * RuntimeObservabilityEngine (EPIC-BLD-36).
 * Passive Production Layer — observe only, never mutate Runtime / State / Knowledge.
 */
export type RuntimeObservabilityEngine = {
  initialize(input: CollectRuntimeInput): RuntimeObservabilityPackage;
  collect(input: CollectRuntimeInput): RuntimeObservabilityPackage;
  aggregate(packageId: string): RuntimeMetrics;
  analyze(packageId: string): RuntimeObservabilityValidation;
  publish(packageId: string): RuntimeObservabilityPackage;
  dispose(packageId: string): RuntimeObservabilityPackage;
  getPackage(packageId: string): RuntimeObservabilityPackage | null;
  listPackages(): readonly RuntimeObservabilityPackage[];
  listObservations(packageId: string): RuntimeObservabilityPackage['timeline']['events'];
  getEvents(): readonly RuntimeObservabilityEvent[];
  getIndex(): readonly RuntimeObservabilityIndexEntry[];
};

export function createRuntimeObservabilityEngine(
  options: RuntimeObservabilityEngineOptions = {},
): RuntimeObservabilityEngine {
  let seq = 0;
  const createId =
    options.createId ??
    ((prefix: string) => {
      seq += 1;
      return `${prefix}-${String(seq).padStart(4, '0')}`;
    });
  const now = options.now ?? (() => new Date());
  const collector = options.collector ?? createBasicObservationCollector();
  const validator =
    options.validator ?? createRuntimeObservabilityValidator({ now });
  const index = options.index ?? createRuntimeObservabilityIndex();

  const packages = new Map<string, RuntimeObservabilityPackage>();
  const events: RuntimeObservabilityEvent[] = [];

  const emit = (
    type: RuntimeObservabilityEvent['type'],
    packageId: string,
    timelineId: string | null,
    message: string,
  ): void => {
    events.push({
      eventId: createId('observability-event'),
      type,
      packageId,
      timelineId,
      at: now().toISOString(),
      message,
    });
  };

  const requirePackage = (packageId: string): RuntimeObservabilityPackage => {
    const pkg = packages.get(packageId);
    if (!pkg) {
      throw new Error(`Observability package not found: ${packageId}`);
    }
    return pkg;
  };

  const store = (pkg: RuntimeObservabilityPackage): RuntimeObservabilityPackage => {
    packages.set(pkg.id, pkg);
    index.index(pkg.id, pkg);
    return pkg;
  };

  const buildPackage = (
    input: CollectRuntimeInput,
  ): RuntimeObservabilityPackage => {
    if (!collector.supports(input)) {
      throw new Error('Observation collector does not support this input.');
    }
    const observations = collector.collect(input, createId);
    const timeline = buildTimeline(
      input.sessionId,
      observations,
      createId,
      now,
      input.title,
    );
    const metrics = aggregateMetrics(observations);
    const stamp = now().toISOString();
    const pkg: RuntimeObservabilityPackage = {
      id: createId('observability-package'),
      version: '1.0.0',
      timeline,
      metrics,
      createdAt: stamp,
      updatedAt: stamp,
      metadata: {
        title: input.title?.trim() || `Observability ${input.sessionId}`,
        sessionId: input.sessionId,
        notes: 'Read-only Runtime Observability package.',
        status: 'Draft',
      },
      validation: null,
    };

    emit(
      'RuntimeObserved',
      pkg.id,
      timeline.id,
      `Collected ${observations.length} observations for session ${input.sessionId}.`,
    );
    emit(
      'TimelineUpdated',
      pkg.id,
      timeline.id,
      `Timeline ${timeline.id} updated with ${timeline.events.length} events.`,
    );
    emit(
      'MetricsCalculated',
      pkg.id,
      timeline.id,
      `Metrics health=${metrics.health} score=${metrics.healthScore}.`,
    );

    return store(pkg);
  };

  return {
    initialize(input) {
      return buildPackage(input);
    },

    collect(input) {
      return buildPackage(input);
    },

    aggregate(packageId) {
      const pkg = requirePackage(packageId);
      const metrics = aggregateMetrics(pkg.timeline.events);
      const next: RuntimeObservabilityPackage = {
        ...pkg,
        metrics,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'MetricsCalculated',
        next.id,
        next.timeline.id,
        `Re-aggregated metrics health=${metrics.health}.`,
      );
      return metrics;
    },

    analyze(packageId) {
      const pkg = requirePackage(packageId);
      const validation = validator.validate(pkg);
      const next: RuntimeObservabilityPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
      };
      store(next);
      emit(
        'ObservabilityValidated',
        next.id,
        next.timeline.id,
        validation.valid
          ? 'Observability package validated.'
          : `Validation failed with ${validation.issues.length} issue(s).`,
      );
      return validation;
    },

    publish(packageId) {
      const pkg = requirePackage(packageId);
      const validation = pkg.validation ?? validator.validate(pkg);
      if (!validation.valid) {
        throw new Error('Cannot publish invalid observability package.');
      }
      const next: RuntimeObservabilityPackage = {
        ...pkg,
        validation,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Published',
          notes: 'Published diagnostic observability package.',
        },
      };
      store(next);
      emit(
        'ObservabilityPublished',
        next.id,
        next.timeline.id,
        `Published observability package ${next.id}.`,
      );
      return next;
    },

    dispose(packageId) {
      const pkg = requirePackage(packageId);
      const next: RuntimeObservabilityPackage = {
        ...pkg,
        updatedAt: now().toISOString(),
        metadata: {
          ...pkg.metadata,
          status: 'Disposed',
          notes: 'Disposed observability package (read-only archive).',
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

    listObservations(packageId) {
      return requirePackage(packageId).timeline.events;
    },

    getEvents() {
      return [...events];
    },

    getIndex() {
      return index.list();
    },
  };
}
