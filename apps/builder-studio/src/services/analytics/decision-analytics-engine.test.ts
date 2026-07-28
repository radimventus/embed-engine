import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createDecisionAnalyticsApi } from './decision-analytics-api';
import { createDecisionAnalyticsEngine } from './decision-analytics-engine';
import { createJsonAnalyticsExporter } from './json-analytics-exporter';

describe('JsonAnalyticsExporter', () => {
  it('serializes snapshot to JSON', () => {
    const engine = createDecisionAnalyticsEngine();
    const session = engine.initialize({
      runtimeSessionId: 'session-demo',
      storyId: 'story-demo',
      runtimeId: 'runtime-demo',
      title: 'Demo Analytics',
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'SessionStarted',
      source: 'runtime-session',
    });
    const snapshot = engine.createSnapshot(session.id);
    const exporter = createJsonAnalyticsExporter();
    const payload = exporter.serialize(snapshot);
    const parsed = JSON.parse(payload) as { id: string; session: { id: string } };
    assert.equal(parsed.id, snapshot.id);
    assert.equal(parsed.session.id, session.id);
  });
});

describe('createDecisionAnalyticsEngine', () => {
  it('records, aggregates, snapshots and exports', () => {
    const engine = createDecisionAnalyticsEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const session = engine.initialize({
      runtimeSessionId: 'session-demo',
      storyId: 'story-demo',
      runtimeId: 'runtime-demo',
      behaviorId: 'behavior-eval-1',
      title: 'Demo Analytics',
    });

    engine.record({
      analyticsSessionId: session.id,
      type: 'SessionStarted',
      source: 'runtime-session',
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'MoveEntered',
      source: 'runtime-session',
      moveId: 'move-1',
      durationMs: 1200,
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'BehaviorEvaluated',
      source: 'behavior',
      moveId: 'move-1',
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'BehaviorActionProposed',
      source: 'behavior',
      moveId: 'move-1',
      note: 'Wait',
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'Timeout',
      source: 'behavior',
      moveId: 'move-1',
    });
    engine.record({
      analyticsSessionId: session.id,
      type: 'SessionCompleted',
      source: 'runtime-session',
    });

    const metrics = engine.aggregate(session.id);
    assert.ok(metrics.some((item) => item.name === 'completionRate'));
    assert.ok(metrics.some((item) => item.name === 'moveCount'));
    assert.ok(metrics.some((item) => item.name === 'averageMoveDuration'));
    assert.ok(metrics.some((item) => item.name === 'pauseCount'));
    assert.ok(metrics.some((item) => item.name === 'skippedMoves'));

    const snapshot = engine.createSnapshot(session.id);
    assert.equal(snapshot.session.id, session.id);
    assert.equal(snapshot.summary.completed, true);
    assert.ok(
      engine
        .getEvents(session.id)
        .some((event) => event.type === 'AnalyticsCollected'),
    );
    assert.ok(
      engine
        .getEvents(session.id)
        .some((event) => event.type === 'MetricCalculated'),
    );
    assert.ok(
      engine
        .getEvents(session.id)
        .some((event) => event.type === 'SnapshotCreated'),
    );

    const exported = engine.exportSnapshot(session.id);
    assert.ok(exported.exportPayload?.includes('"completionRate"'));
    assert.ok(
      engine
        .getEvents(session.id)
        .some((event) => event.type === 'AnalyticsExported'),
    );
  });

  it('exposes API record/preview/export/list and dispose', () => {
    const engine = createDecisionAnalyticsEngine();
    const api = createDecisionAnalyticsApi(engine);
    api.initializeAnalytics({
      runtimeSessionId: 'session-api',
      storyId: 'story-api',
      runtimeId: 'runtime-api',
    });
    const analyticsSessionId = 'analytics-session-session-api';
    api.recordAnalytics({
      analyticsSessionId,
      type: 'SessionStarted',
      source: 'runtime-session',
    });
    api.recordAnalytics({
      analyticsSessionId,
      type: 'MoveEntered',
      source: 'runtime-session',
      moveId: 'move-1',
      durationMs: 500,
    });
    engine.aggregate(analyticsSessionId);
    const snapshot = api.createAnalyticsSnapshot(analyticsSessionId);
    assert.ok(api.previewAnalytics(analyticsSessionId));
    assert.equal(api.listAnalyticsEvents(analyticsSessionId).length, 2);
    assert.ok(api.listAnalyticsMetrics(analyticsSessionId).length >= 5);
    const exported = api.exportAnalytics(analyticsSessionId);
    assert.ok(exported.exportPayload !== null);
    assert.equal(snapshot.session.runtimeSessionId, 'session-api');
    engine.dispose(analyticsSessionId);
    assert.equal(engine.load(analyticsSessionId), null);
  });
});
