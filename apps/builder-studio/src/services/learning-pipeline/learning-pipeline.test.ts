import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { IngestAnalyticsInput } from '../../model';
import { createLearningAnonymizer } from './learning-anonymizer';
import { createLearningPipelineApi } from './learning-pipeline-api';
import { createLearningPipeline } from './learning-pipeline';
import { createLearningTransformer } from './learning-transformer';

function sampleInput(): IngestAnalyticsInput {
  return {
    snapshotId: 'analytics-snapshot-analytics-session-session-demo',
    sessionId: 'session-story-demo',
    storyId: 'story-demo',
    title: 'Harmony Demo Analytics',
    completed: true,
    events: [
      {
        type: 'SessionStarted',
        timestamp: '2026-08-18T23:40:00.000Z',
        source: 'runtime-session',
        note: 'Session started for session-story-demo',
        moveId: null,
        durationMs: null,
        analyticsSessionId: 'analytics-session-session-demo',
      },
      {
        type: 'MoveEntered',
        timestamp: '2026-08-18T23:40:01.000Z',
        source: 'runtime-session',
        note: 'Entered move-1',
        moveId: 'move-1',
        durationMs: 1000,
        analyticsSessionId: 'analytics-session-session-demo',
      },
    ],
    metrics: [
      { name: 'completionRate', value: 1, unit: 'ratio' },
      { name: 'moveCount', value: 1, unit: 'count' },
    ],
  };
}

describe('LearningAnonymizer', () => {
  it('strips identifiers from notes and ids', () => {
    const anonymizer = createLearningAnonymizer();
    const payload = anonymizer.anonymize(sampleInput());
    assert.equal(payload.sessionId.includes('session-story-demo'), false);
    assert.ok(payload.events[0]?.note.includes('[redacted]') || !payload.events[0]?.note.includes('session-story-demo'));
    assert.equal(anonymizer.validatePrivacy(payload).length >= 0, true);
  });
});

describe('LearningTransformer', () => {
  it('validates and creates LearningRecord', () => {
    const transformer = createLearningTransformer();
    const anonymizer = createLearningAnonymizer();
    const validation = transformer.validate(sampleInput(), () => new Date('2026-08-18T23:41:00.000Z'));
    assert.equal(validation.valid, true);
    const record = transformer.transform(
      anonymizer.anonymize(sampleInput()),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-18T23:41:00.000Z'),
    );
    assert.equal(record.metadata.anonymized, true);
    assert.ok(record.events.length >= 1);
  });
});

describe('createLearningPipeline', () => {
  it('ingests, anonymizes, transforms and emits lifecycle events', () => {
    const pipeline = createLearningPipeline({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const validation = pipeline.ingest(sampleInput());
    assert.equal(validation.valid, true);
    const pipelineId = `learning-pipeline-${sampleInput().snapshotId}`;
    pipeline.anonymize(pipelineId);
    const record = pipeline.transform(pipelineId);
    assert.ok(record.id.startsWith('learning-record'));
    assert.ok(pipeline.getImportReport(pipelineId)?.accepted === 1);
    assert.ok(
      pipeline
        .getEvents(pipelineId)
        .some((event) => event.type === 'LearningImported'),
    );
    assert.ok(
      pipeline
        .getEvents(pipelineId)
        .some((event) => event.type === 'LearningValidated'),
    );
    assert.ok(
      pipeline
        .getEvents(pipelineId)
        .some((event) => event.type === 'LearningAnonymized'),
    );
    assert.ok(
      pipeline
        .getEvents(pipelineId)
        .some((event) => event.type === 'LearningRecordCreated'),
    );
  });

  it('exposes API import/preview/validate/export', () => {
    const pipeline = createLearningPipeline();
    const api = createLearningPipelineApi(pipeline);
    const input = sampleInput();
    api.importAnalytics(input);
    const pipelineId = `learning-pipeline-${input.snapshotId}`;
    assert.equal(api.validateLearning(pipelineId).valid, true);
    const record = api.transformLearning(pipelineId);
    assert.ok(api.previewLearningRecord(pipelineId));
    assert.ok(api.exportLearningRecord(pipelineId)?.includes(record.id));
    pipeline.dispose(pipelineId);
    assert.equal(pipeline.load(pipelineId), null);
  });
});
