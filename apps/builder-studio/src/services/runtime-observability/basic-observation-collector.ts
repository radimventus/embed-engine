import type {
  CollectRuntimeInput,
  RuntimeMetrics,
  RuntimeObservation,
  RuntimeObservabilityPackage,
  RuntimeObservabilityValidation,
  RuntimeObservabilityValidationIssue,
  RuntimeTimeline,
} from '../../model';

/**
 * ObservationCollector (EPIC-BLD-36).
 * Read-only collection of Runtime events — no mutation.
 */
export type ObservationCollector = {
  readonly id: string;
  supports(input: CollectRuntimeInput): boolean;
  collect(
    input: CollectRuntimeInput,
    createId: (prefix: string) => string,
  ): readonly RuntimeObservation[];
};

/**
 * BasicObservationCollector — maps source events to observations.
 */
export function createBasicObservationCollector(): ObservationCollector {
  return {
    id: 'basic-observation-collector',

    supports(input) {
      return (
        input.sessionId.trim().length > 0 && input.sources.length > 0
      );
    },

    collect(input, createId) {
      return input.sources
        .filter((source) => source.sessionId === input.sessionId)
        .map((source) => ({
          id: createId('runtime-observation'),
          sessionId: source.sessionId,
          executionId: source.executionId ?? null,
          moduleId: source.moduleId ?? null,
          event: source.event,
          timestamp: source.timestamp,
          metadata: {
            source: source.source,
            notes: `Observed ${source.event} from ${source.source}.`,
          },
        }))
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    },
  };
}

export function aggregateMetrics(
  observations: readonly RuntimeObservation[],
): RuntimeMetrics {
  const sessions = new Set(observations.map((item) => item.sessionId));
  const executions = new Set(
    observations
      .map((item) => item.executionId)
      .filter((item): item is string => item !== null),
  );
  const moduleEventCount = observations.filter(
    (item) => item.moduleId !== null || item.metadata.source.includes('module'),
  ).length;
  const stateEventCount = observations.filter((item) =>
    item.metadata.source.includes('state'),
  ).length;

  const observationCount = observations.length;
  let healthScore = 0.5;
  if (observationCount === 0) {
    healthScore = 0.2;
  } else if (observationCount < 3) {
    healthScore = 0.55;
  } else if (observationCount < 8) {
    healthScore = 0.75;
  } else {
    healthScore = 0.9;
  }
  if (executions.size > 0) {
    healthScore = Math.min(1, healthScore + 0.05);
  }

  const health =
    observationCount === 0
      ? ('Unknown' as const)
      : healthScore >= 0.7
        ? ('Healthy' as const)
        : ('Degraded' as const);

  return {
    observationCount,
    sessionCount: sessions.size,
    executionCount: executions.size,
    moduleEventCount,
    stateEventCount,
    health,
    healthScore: Math.round(healthScore * 1000) / 1000,
  };
}

export function buildTimeline(
  sessionId: string,
  observations: readonly RuntimeObservation[],
  createId: (prefix: string) => string,
  now: () => Date,
  title?: string,
): RuntimeTimeline {
  const stamp = now().toISOString();
  return {
    id: createId('runtime-timeline'),
    sessionId,
    events: observations,
    startedAt: observations[0]?.timestamp ?? stamp,
    updatedAt: stamp,
    metadata: {
      title: title?.trim() || `Runtime Timeline ${sessionId}`,
      notes: 'Read-only observation timeline.',
    },
  };
}

/**
 * RuntimeObservabilityValidator (EPIC-BLD-36).
 */
export type RuntimeObservabilityValidator = {
  validate(pkg: RuntimeObservabilityPackage): RuntimeObservabilityValidation;
  validateTimeline(
    pkg: RuntimeObservabilityPackage,
  ): readonly RuntimeObservabilityValidationIssue[];
  validateMetrics(
    pkg: RuntimeObservabilityPackage,
  ): readonly RuntimeObservabilityValidationIssue[];
  validateIntegrity(
    pkg: RuntimeObservabilityPackage,
  ): readonly RuntimeObservabilityValidationIssue[];
};

export function createRuntimeObservabilityValidator(options?: {
  readonly now?: () => Date;
}): RuntimeObservabilityValidator {
  const now = options?.now ?? (() => new Date());

  const validateTimeline = (
    pkg: RuntimeObservabilityPackage,
  ): RuntimeObservabilityValidationIssue[] => {
    const issues: RuntimeObservabilityValidationIssue[] = [];
    if (pkg.timeline.events.length === 0) {
      issues.push({
        code: 'empty-timeline',
        severity: 'error',
        message: `Timeline ${pkg.timeline.id} has no events.`,
      });
    }
    if (!pkg.timeline.sessionId.trim()) {
      issues.push({
        code: 'timeline-missing-session',
        severity: 'error',
        message: `Timeline ${pkg.timeline.id} missing sessionId.`,
      });
    }
    for (const item of pkg.timeline.events) {
      if (!item.event.trim()) {
        issues.push({
          code: 'observation-missing-event',
          severity: 'error',
          message: `Observation ${item.id} missing event.`,
        });
      }
      if (!item.timestamp.trim()) {
        issues.push({
          code: 'observation-missing-timestamp',
          severity: 'error',
          message: `Observation ${item.id} missing timestamp.`,
        });
      }
    }
    return issues;
  };

  const validateMetrics = (
    pkg: RuntimeObservabilityPackage,
  ): RuntimeObservabilityValidationIssue[] => {
    const issues: RuntimeObservabilityValidationIssue[] = [];
    if (pkg.metrics.observationCount !== pkg.timeline.events.length) {
      issues.push({
        code: 'metrics-count-mismatch',
        severity: 'error',
        message: 'Metrics observationCount does not match timeline events.',
      });
    }
    if (pkg.metrics.healthScore < 0 || pkg.metrics.healthScore > 1) {
      issues.push({
        code: 'invalid-health-score',
        severity: 'error',
        message: `Health score out of range (${pkg.metrics.healthScore}).`,
      });
    }
    if (pkg.metrics.health === 'Unknown' && pkg.metrics.observationCount > 0) {
      issues.push({
        code: 'unknown-health-with-data',
        severity: 'warning',
        message: 'Health is Unknown despite having observations.',
      });
    }
    return issues;
  };

  const validateIntegrity = (
    pkg: RuntimeObservabilityPackage,
  ): RuntimeObservabilityValidationIssue[] => {
    const issues: RuntimeObservabilityValidationIssue[] = [];
    if (pkg.metadata.sessionId !== pkg.timeline.sessionId) {
      issues.push({
        code: 'session-mismatch',
        severity: 'error',
        message: 'Package sessionId does not match timeline.sessionId.',
      });
    }
    for (const item of pkg.timeline.events) {
      if (item.sessionId !== pkg.timeline.sessionId) {
        issues.push({
          code: 'observation-session-mismatch',
          severity: 'error',
          message: `Observation ${item.id} session mismatch.`,
        });
      }
    }
    return issues;
  };

  return {
    validateTimeline,
    validateMetrics,
    validateIntegrity,
    validate(pkg) {
      const issues = [
        ...validateTimeline(pkg),
        ...validateMetrics(pkg),
        ...validateIntegrity(pkg),
      ];
      return {
        valid: !issues.some((item) => item.severity === 'error'),
        issues,
        validatedAt: now().toISOString(),
      };
    },
  };
}
