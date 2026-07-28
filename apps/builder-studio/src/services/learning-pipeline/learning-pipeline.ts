import type {
  IngestAnalyticsInput,
  LearningImportReport,
  LearningPipelineEvent,
  LearningRecord,
  LearningValidationResult,
} from '../../model';
import {
  createLearningAnonymizer,
  type LearningAnonymizer,
} from './learning-anonymizer';
import {
  createLearningTransformer,
  type LearningTransformer,
} from './learning-transformer';

const MAX_HISTORY = 40;

export type LearningPipeline = {
  initialize(pipelineId?: string): string;
  ingest(input: IngestAnalyticsInput): LearningValidationResult;
  validate(pipelineId: string): LearningValidationResult;
  anonymize(pipelineId: string): LearningValidationResult;
  transform(pipelineId: string): LearningRecord;
  dispose(pipelineId: string): void;
  load(pipelineId: string): LearningRecord | null;
  preview(pipelineId: string): LearningRecord | null;
  getImportReport(pipelineId: string): LearningImportReport | null;
  getValidation(pipelineId: string): LearningValidationResult | null;
  exportRecord(pipelineId: string): string | null;
  getEvents(pipelineId?: string): readonly LearningPipelineEvent[];
  getHistory(pipelineId?: string): readonly LearningPipelineEvent[];
  list(): readonly LearningRecord[];
};

type PipelineStore = {
  id: string;
  input: IngestAnalyticsInput | null;
  validation: LearningValidationResult | null;
  anonymized: boolean;
  record: LearningRecord | null;
  report: LearningImportReport | null;
  exportPayload: string | null;
};

/**
 * LearningPipeline (EPIC-BLD-22).
 * Pure transformation: Analytics Snapshot → LearningRecord.
 */
export function createLearningPipeline(options?: {
  readonly now?: () => Date;
  readonly createId?: (prefix: string) => string;
  readonly anonymizer?: LearningAnonymizer;
  readonly transformer?: LearningTransformer;
}): LearningPipeline {
  const now = options?.now ?? (() => new Date());
  let sequence = 0;
  const createId =
    options?.createId ??
    ((prefix: string) => {
      sequence += 1;
      return `${prefix}-${sequence}`;
    });

  const anonymizer = options?.anonymizer ?? createLearningAnonymizer();
  const transformer = options?.transformer ?? createLearningTransformer();
  const stores = new Map<string, PipelineStore>();
  const events: LearningPipelineEvent[] = [];

  const pushEvent = (
    type: LearningPipelineEvent['type'],
    pipelineId: string,
    recordId: string | null,
    snapshotId: string | null,
    message: string,
  ): void => {
    events.unshift({
      eventId: createId('learning-pipeline-event'),
      type,
      pipelineId,
      recordId,
      snapshotId,
      at: now().toISOString(),
      message,
    });
    if (events.length > MAX_HISTORY) {
      events.length = MAX_HISTORY;
    }
  };

  const requireStore = (pipelineId: string): PipelineStore => {
    const store = stores.get(pipelineId);
    if (store === undefined) {
      throw new Error(`LearningPipeline not found: ${pipelineId}`);
    }
    return store;
  };

  return {
    initialize(pipelineId) {
      const id = pipelineId ?? createId('learning-pipeline');
      if (!stores.has(id)) {
        stores.set(id, {
          id,
          input: null,
          validation: null,
          anonymized: false,
          record: null,
          report: null,
          exportPayload: null,
        });
      }
      return id;
    },

    ingest(input) {
      const pipelineId = `learning-pipeline-${input.snapshotId}`;
      this.initialize(pipelineId);
      const store = requireStore(pipelineId);
      store.input = input;
      store.anonymized = false;
      store.record = null;
      store.exportPayload = null;

      const validation = transformer.validate(input, now);
      store.validation = validation;
      store.report = {
        processed: 1,
        accepted: validation.valid ? 0 : 0,
        rejected: validation.valid ? 0 : 1,
        warnings: validation.warnings.length,
        metadata: {
          title: 'Learning Import Report',
          pipelineId,
          notes: 'Ingested Analytics Snapshot — pending transform.',
        },
      };

      pushEvent(
        'LearningImported',
        pipelineId,
        null,
        input.snapshotId,
        `Imported snapshot ${input.snapshotId}`,
      );
      pushEvent(
        'LearningValidated',
        pipelineId,
        null,
        input.snapshotId,
        validation.valid
          ? 'Validation OK'
          : `Validation failed (${validation.errors.length} errors)`,
      );
      return validation;
    },

    validate(pipelineId) {
      const store = requireStore(pipelineId);
      if (store.input === null) {
        throw new Error(`No ingested snapshot for pipeline: ${pipelineId}`);
      }
      const validation = transformer.validate(store.input, now);
      store.validation = validation;
      pushEvent(
        'LearningValidated',
        pipelineId,
        store.record?.id ?? null,
        store.input.snapshotId,
        validation.valid
          ? 'Validation OK'
          : `Validation failed (${validation.errors.length} errors)`,
      );
      return validation;
    },

    anonymize(pipelineId) {
      const store = requireStore(pipelineId);
      if (store.input === null) {
        throw new Error(`No ingested snapshot for pipeline: ${pipelineId}`);
      }
      const validation =
        store.validation ?? transformer.validate(store.input, now);
      if (!validation.valid) {
        store.validation = validation;
        return validation;
      }

      const payload = anonymizer.anonymize(store.input);
      const privacyIssues = anonymizer.validatePrivacy(payload);
      store.anonymized = true;
      store.input = {
        ...store.input,
        snapshotId: payload.snapshotId,
        sessionId: payload.sessionId,
        storyId: payload.storyRef ?? '',
        title: payload.title,
        events: payload.events.map((event) => ({
          type: event.type,
          timestamp: event.timestamp,
          source: event.source,
          note: event.note,
          moveId: event.moveRef,
          durationMs: event.durationMs,
          analyticsSessionId: payload.sessionId,
        })),
        metrics: payload.metrics,
        completed: payload.completed,
      };

      const nextValidation: LearningValidationResult = {
        ...validation,
        warnings: [
          ...validation.warnings,
          ...privacyIssues.map((message) => ({
            code: 'privacy-warning',
            severity: 'warning' as const,
            message,
          })),
        ],
      };
      store.validation = nextValidation;
      pushEvent(
        'LearningAnonymized',
        pipelineId,
        null,
        payload.snapshotId,
        `Anonymized snapshot (${privacyIssues.length} privacy notes)`,
      );
      return nextValidation;
    },

    transform(pipelineId) {
      const store = requireStore(pipelineId);
      if (store.input === null) {
        throw new Error(`No ingested snapshot for pipeline: ${pipelineId}`);
      }
      if (!store.anonymized) {
        this.anonymize(pipelineId);
      }
      const validation =
        store.validation ?? transformer.validate(store.input, now);
      if (!validation.valid) {
        store.report = {
          processed: 1,
          accepted: 0,
          rejected: 1,
          warnings: validation.warnings.length,
          metadata: {
            title: 'Learning Import Report',
            pipelineId,
            notes: 'Rejected — validation failed.',
          },
        };
        throw new Error(
          validation.errors.map((item) => item.message).join(' '),
        );
      }

      const payload = anonymizer.anonymize(store.input);
      const record = transformer.transform(payload, createId, now);
      store.record = record;
      store.exportPayload = JSON.stringify(record, null, 2);
      store.report = {
        processed: 1,
        accepted: 1,
        rejected: 0,
        warnings: validation.warnings.length,
        metadata: {
          title: 'Learning Import Report',
          pipelineId,
          notes: 'LearningRecord created from Analytics Snapshot.',
        },
      };
      pushEvent(
        'LearningRecordCreated',
        pipelineId,
        record.id,
        record.sourceSnapshotId,
        `Created LearningRecord ${record.id}`,
      );
      return record;
    },

    dispose(pipelineId) {
      stores.delete(pipelineId);
    },

    load(pipelineId) {
      return stores.get(pipelineId)?.record ?? null;
    },

    preview(pipelineId) {
      return stores.get(pipelineId)?.record ?? null;
    },

    getImportReport(pipelineId) {
      return stores.get(pipelineId)?.report ?? null;
    },

    getValidation(pipelineId) {
      return stores.get(pipelineId)?.validation ?? null;
    },

    exportRecord(pipelineId) {
      return stores.get(pipelineId)?.exportPayload ?? null;
    },

    getEvents(pipelineId) {
      if (pipelineId === undefined) {
        return [...events];
      }
      return events.filter((item) => item.pipelineId === pipelineId);
    },

    getHistory(pipelineId) {
      return this.getEvents(pipelineId);
    },

    list() {
      return Array.from(stores.values())
        .map((store) => store.record)
        .filter((item): item is LearningRecord => item !== null);
    },
  };
}
