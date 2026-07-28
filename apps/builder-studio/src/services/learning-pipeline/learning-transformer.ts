import type {
  LearningRecord,
  LearningValidationIssue,
  LearningValidationResult,
} from '../../model';
import type { AnonymizedLearningPayload } from './learning-anonymizer';

/**
 * LearningTransformer (EPIC-BLD-22).
 * Analytics Snapshot payload → LearningRecord — no heuristics.
 */
export type LearningTransformer = {
  transform(
    payload: AnonymizedLearningPayload,
    createId: (prefix: string) => string,
    now: () => Date,
  ): LearningRecord;
  normalize(payload: AnonymizedLearningPayload): AnonymizedLearningPayload;
  createRecord(
    payload: AnonymizedLearningPayload,
    createId: (prefix: string) => string,
    now: () => Date,
  ): LearningRecord;
  validate(
    input: {
      readonly snapshotId: string;
      readonly events: readonly unknown[];
      readonly metrics: readonly unknown[];
    },
    now: () => Date,
  ): LearningValidationResult;
};

export function createLearningTransformer(): LearningTransformer {
  const normalize = (
    payload: AnonymizedLearningPayload,
  ): AnonymizedLearningPayload => ({
    ...payload,
    events: [...payload.events].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    ),
    metrics: [...payload.metrics].sort((a, b) => a.name.localeCompare(b.name)),
  });

  const createRecord = (
    payload: AnonymizedLearningPayload,
    createId: (prefix: string) => string,
    now: () => Date,
  ): LearningRecord => {
    const normalized = normalize(payload);
    return {
      id: createId('learning-record'),
      sourceSnapshotId: normalized.snapshotId,
      sessionId: normalized.sessionId,
      timestamp: now().toISOString(),
      events: normalized.events.map((event) => ({
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
        note: event.note,
        moveRef: event.moveRef,
        durationMs: event.durationMs,
      })),
      metrics: normalized.metrics.map((metric) => ({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
      })),
      metadata: {
        title: normalized.title,
        anonymized: true,
        storyRef: normalized.storyRef,
      },
    };
  };

  return {
    normalize,
    createRecord,
    transform(payload, createId, now) {
      return createRecord(payload, createId, now);
    },

    validate(input, now) {
      const errors: LearningValidationIssue[] = [];
      const warnings: LearningValidationIssue[] = [];

      if (input.snapshotId.trim() === '') {
        errors.push({
          code: 'missing-snapshot',
          severity: 'error',
          message: 'sourceSnapshotId is required.',
        });
      }
      if (input.events.length === 0) {
        errors.push({
          code: 'empty-events',
          severity: 'error',
          message: 'Analytics Snapshot has no events to import.',
        });
      }
      if (input.metrics.length === 0) {
        warnings.push({
          code: 'empty-metrics',
          severity: 'warning',
          message: 'Analytics Snapshot has no metrics.',
        });
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          validatedAt: now().toISOString(),
          sourceSnapshotId: input.snapshotId,
        },
      };
    },
  };
}
