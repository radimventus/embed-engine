import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { REFERENCE_HOUSE_PACKAGE } from '@embed-engine/object-house';
import {
  createFixedClock,
  createDecisionSessionRuntime,
} from '@embed-engine/runtime';

import {
  categorizeAiQuestion,
  createDecisionAnalyticsCollector,
  createMemoryExportAdapter,
  deriveSessionMetrics,
} from './index';

const here = dirname(fileURLToPath(import.meta.url));

describe('Decision Analytics (CSCB-08)', () => {
  it('observes Runtime dispatch signals without mutating session semantics', () => {
    const memory = createMemoryExportAdapter();
    const collector = createDecisionAnalyticsCollector({
      sessionId: 'test-session',
      decisionSessionId: 'decision-session:test',
      adapter: memory,
      now: (() => {
        let t = 1000;
        return () => {
          t += 10;
          return t;
        };
      })(),
    });

    collector.startJourney();
    const runtime = createDecisionSessionRuntime({
      clock: createFixedClock(1),
      housePackage: REFERENCE_HOUSE_PACKAGE,
      now: 1,
    });
    const result = runtime.dispatch(
      { type: 'ChangePriority', priorityIds: ['energy', 'layout', 'plot'] },
      2,
    );
    assert.equal(result.ok, true);
    if (result.ok) {
      collector.observeDispatch(result);
    }

    const types = memory.events.map((event) => event.type);
    assert.ok(types.includes('journey.started'));
    assert.ok(types.includes('runtime.signal'));
    assert.ok(types.includes('terminal.viewed'));
    assert.ok(types.includes('story.viewed'));

    const signal = memory.events.find((event) => event.type === 'runtime.signal');
    assert.equal(signal?.type, 'runtime.signal');
    if (signal?.type === 'runtime.signal') {
      assert.equal(signal.runtimeEventType, 'PriorityChanged');
      assert.equal(signal.payload.priorityCount, 3);
      assert.equal(signal.sessionId, 'test-session');
      assert.ok(signal.decisionSessionId.length > 0);
      assert.ok(signal.runtimeContextRef?.terminalId);
    }
  });

  it('tracks lifecycle, surfaces, AI metadata, and conversion funnel', () => {
    const memory = createMemoryExportAdapter();
    let t = 0;
    const collector = createDecisionAnalyticsCollector({
      sessionId: 'metrics-session',
      decisionSessionId: 'decision:metrics',
      adapter: memory,
      now: () => {
        t += 100;
        return t;
      },
    });

    collector.startJourney();
    collector.enterSurface('hero');
    collector.enterSurface('walkthrough');
    collector.exitSurface('hero');
    collector.resumeJourney();
    collector.aiSessionOpened('ai-context:terminal-1');
    collector.aiInteraction({
      questionCategory: categorizeAiQuestion('Proč je toto doporučeno?'),
      responseGenerated: true,
      clarificationRequested: false,
      conversationLength: 4,
    });
    collector.aiSessionEnded(4);
    collector.conversionStarted('request-consultation');
    collector.conversionFormOpened('request-consultation');
    collector.conversionConsentAccepted('request-consultation');
    collector.conversionCompleted('request-consultation');

    const metrics = collector.getMetrics();
    assert.equal(metrics.sessionId, 'metrics-session');
    assert.equal(metrics.journeyCompleted, true);
    assert.equal(metrics.conversionCompletedCount, 1);
    assert.equal(metrics.aiInteractionCount, 1);
    assert.ok((metrics.surfaceDwellMs.hero ?? 0) > 0);
    assert.equal(metrics.surfaceEnterCounts.walkthrough, 1);
    assert.equal(categorizeAiQuestion('Proč je toto doporučeno?'), 'why-recommendation');

    collector.abandonJourney(); // no-op after complete
    assert.equal(
      memory.events.filter((event) => event.type === 'journey.abandoned').length,
      0,
    );
  });

  it('emits abandoned when journey is incomplete', () => {
    const memory = createMemoryExportAdapter();
    const collector = createDecisionAnalyticsCollector({
      sessionId: 'abandon-session',
      adapter: memory,
      now: () => 1,
    });
    collector.startJourney();
    collector.abandonJourney();
    assert.ok(memory.events.some((event) => event.type === 'journey.abandoned'));
    const metrics = deriveSessionMetrics('abandon-session', memory.events);
    assert.equal(metrics.journeyAbandoned, true);
  });

  it('never stores AI prompt/response bodies in events', () => {
    const memory = createMemoryExportAdapter();
    const collector = createDecisionAnalyticsCollector({
      sessionId: 'privacy-session',
      adapter: memory,
      now: () => 1,
    });
    collector.aiInteraction({
      questionCategory: 'why-recommendation',
      responseGenerated: true,
      clarificationRequested: false,
      conversationLength: 2,
    });
    const raw = JSON.stringify(memory.events);
    assert.equal(raw.includes('Proč'), false);
    assert.equal(raw.includes('AI odpověď'), false);
    assert.match(raw, /why-recommendation/);
  });

  it('Client Studio page mounts analytics outside Runtime mutation path', () => {
    const page = readFileSync(join(here, '../ClientStudioPage.tsx'), 'utf8');
    assert.match(page, /DecisionAnalyticsProvider/);
    assert.match(page, /JourneySurfaceObserver/);
    const provider = readFileSync(
      join(here, '../runtime/DecisionSessionRuntimeProvider.tsx'),
      'utf8',
    );
    assert.match(provider, /observeDispatch/);
    assert.equal(provider.includes('composeDecision'), false);
  });
});
