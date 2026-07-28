import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BehaviorSignal, EvaluateBehaviorInput } from '../../model';
import { createBasicBehaviorStrategy } from './basic-behavior-strategy';
import { createBehaviorApi } from './behavior-api';
import { createBehaviorEngine } from './behavior-engine';

function sampleInput(
  signals: readonly BehaviorSignal[] = [],
): EvaluateBehaviorInput {
  return {
    sessionId: 'session-story-demo',
    currentMove: 'move-1',
    history: [
      {
        moveId: 'move-1',
        action: 'entered',
        timestamp: '2026-08-18T23:30:00.000Z',
      },
    ],
    signals,
    title: 'Demo Behavior',
  };
}

function signal(
  type: BehaviorSignal['type'],
  id: string,
): BehaviorSignal {
  return {
    id,
    type,
    source: 'runtime-session',
    timestamp: '2026-08-18T23:30:01.000Z',
    payload: { moveId: 'move-1', note: `${type} note` },
    metadata: { sessionId: 'session-story-demo' },
  };
}

describe('BasicBehaviorStrategy', () => {
  it('proposes Highlight+Continue for MoveEntered', () => {
    const strategy = createBasicBehaviorStrategy();
    const context = {
      sessionId: 'session-story-demo',
      currentMove: 'move-1',
      history: [],
      signals: [signal('MoveEntered', 'sig-1')],
      metadata: { title: 'ctx', notes: 'n' },
    };
    const actions = strategy.propose(context, (prefix) => `${prefix}-x`);
    assert.ok(actions.some((item) => item.type === 'Highlight'));
    assert.ok(actions.some((item) => item.type === 'Continue'));
  });

  it('proposes Wait for PauseDetected', () => {
    const strategy = createBasicBehaviorStrategy();
    const actions = strategy.propose(
      {
        sessionId: 'session-story-demo',
        currentMove: 'move-1',
        history: [],
        signals: [signal('PauseDetected', 'sig-pause')],
        metadata: { title: 'ctx', notes: 'n' },
      },
      (prefix) => `${prefix}-y`,
    );
    assert.equal(actions[0]?.type, 'Wait');
  });
});

describe('createBehaviorEngine', () => {
  it('evaluates and emits BehaviorEvaluated / BehaviorActionProposed', () => {
    const engine = createBehaviorEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    engine.initialize('session-story-demo');
    const received = engine.receiveSignal(signal('Timeout', 'sig-timeout'));
    assert.equal(received.type, 'Timeout');
    assert.ok(
      engine
        .getEvents('session-story-demo')
        .some((event) => event.type === 'BehaviorSignalReceived'),
    );

    const evaluation = engine.evaluate(
      sampleInput([signal('Timeout', 'sig-timeout')]),
    );
    assert.ok(evaluation.actions.some((item) => item.type === 'Suggest'));
    assert.ok(
      engine
        .getEvents('session-story-demo')
        .some((event) => event.type === 'BehaviorEvaluated'),
    );
    assert.ok(
      engine
        .getEvents('session-story-demo')
        .some((event) => event.type === 'BehaviorActionProposed'),
    );
    assert.equal(engine.proposeActions('session-story-demo').length > 0, true);
  });

  it('exposes API evaluate/preview/listSignals and dispose', () => {
    const engine = createBehaviorEngine();
    const api = createBehaviorApi(engine);
    const evaluation = api.evaluateBehavior(
      sampleInput([signal('UserAction', 'sig-user')]),
    );
    assert.ok(api.previewBehavior(evaluation.sessionId));
    assert.ok(api.listBehaviorSignals(evaluation.sessionId).length >= 1);
    engine.dispose(evaluation.sessionId);
    assert.equal(engine.load(evaluation.sessionId), null);
  });
});
