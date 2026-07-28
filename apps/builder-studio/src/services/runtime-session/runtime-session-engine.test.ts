import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CreateSessionInput } from '../../model';
import { createRuntimeSessionApi } from './runtime-session-api';
import { createRuntimeSessionEngine } from './runtime-session-engine';
import { createSessionNavigator } from './session-navigator';
import { createSessionValidator } from './session-validator';

function sampleInput(): CreateSessionInput {
  return {
    runtimeId: 'runtime-decision-model-object-harmony-124',
    storyId: 'story-evaluation-decision-model-object-harmony-124',
    title: 'Harmony Runtime Session',
    moveIds: ['move-1', 'move-2', 'move-3'],
  };
}

describe('SessionNavigator', () => {
  it('navigates sequentially without branching', () => {
    const navigator = createSessionNavigator(
      ['move-1', 'move-2', 'move-3'],
      'move-2',
    );
    assert.equal(navigator.current(), 'move-2');
    assert.equal(navigator.next(), 'move-3');
    assert.equal(navigator.previous(), 'move-1');
    assert.equal(navigator.jumpTo('move-1'), 'move-1');
    assert.equal(navigator.jumpTo('unknown'), null);
  });
});

describe('SessionValidator', () => {
  it('validates story input and navigation targets', () => {
    const validator = createSessionValidator({
      now: () => new Date('2026-08-18T23:00:00.000Z'),
    });
    const issues = validator.validateStory({
      runtimeId: '',
      storyId: '',
      moveIds: [],
    });
    assert.ok(issues.some((item) => item.code === 'missing-story'));
    assert.ok(issues.some((item) => item.code === 'empty-moves'));
  });
});

describe('createRuntimeSessionEngine', () => {
  it('creates, starts, navigates and completes a session', () => {
    const engine = createRuntimeSessionEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = engine.createSession(sampleInput());
    assert.equal(created.status, 'Created');
    assert.equal(created.currentMoveId, null);
    assert.ok(
      engine.getEvents(created.id).some((event) => event.type === 'SessionCreated'),
    );

    const started = engine.start(created.id);
    assert.equal(started.status, 'Running');
    assert.equal(started.currentMoveId, 'move-1');
    assert.ok(
      engine.getEvents(started.id).some((event) => event.type === 'SessionStarted'),
    );
    assert.ok(
      engine.getEvents(started.id).some((event) => event.type === 'MoveEntered'),
    );

    const advanced = engine.nextMove(started.id);
    assert.equal(advanced.currentMoveId, 'move-2');
    assert.ok(
      engine.getEvents(advanced.id).some((event) => event.type === 'MoveCompleted'),
    );

    const rewound = engine.previousMove(advanced.id);
    assert.equal(rewound.currentMoveId, 'move-1');

    const completed = engine.complete(rewound.id);
    assert.equal(completed.status, 'Completed');
    assert.ok(
      engine
        .getEvents(completed.id)
        .some((event) => event.type === 'SessionCompleted'),
    );

    const disposed = engine.dispose(completed.id);
    assert.equal(disposed.status, 'Disposed');
    assert.ok(
      engine
        .getEvents(disposed.id)
        .some((event) => event.type === 'SessionDisposed'),
    );
  });

  it('exposes API create/start/next/previous/complete/preview', () => {
    const engine = createRuntimeSessionEngine();
    const api = createRuntimeSessionApi(engine);
    const session = api.createSession(sampleInput());
    const started = api.startSession(session.id);
    assert.equal(started.currentMoveId, 'move-1');
    const next = api.nextMove(session.id);
    assert.equal(next.currentMoveId, 'move-2');
    const previous = api.previousMove(session.id);
    assert.equal(previous.currentMoveId, 'move-1');
    const completed = api.completeSession(session.id);
    assert.equal(completed.status, 'Completed');
    assert.ok(api.previewSession(session.id));
  });
});
