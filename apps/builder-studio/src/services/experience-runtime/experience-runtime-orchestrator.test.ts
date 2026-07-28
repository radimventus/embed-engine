import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { StartRuntimeInput } from '../../model';
import {
  createBasicRuntimeStrategy,
  createRuntimeValidator,
} from './basic-runtime-strategy';
import { createExperienceRuntimeApi } from './experience-runtime-api';
import { createExperienceRuntimeOrchestrator } from './experience-runtime-orchestrator';
import { createRuntimeIndex } from './runtime-index';

function sampleInput(): StartRuntimeInput {
  return {
    sessionId: 'runtime-session-1',
    storyId: 'decision-story-1',
    moveIds: ['move-1', 'move-2', 'move-3'],
    title: 'Demo Runtime Execution',
    personalizedContextPackageId: 'personalized-context-package-1',
    behaviorEvaluationId: 'behavior-evaluation-1',
    moduleIds: ['module-priority', 'module-faq'],
  };
}

describe('BasicRuntimeStrategy', () => {
  it('resolves next, previous and jump', () => {
    const strategy = createBasicRuntimeStrategy();
    assert.equal(strategy.supports(sampleInput()), true);

    const base = {
      id: 'e1',
      sessionId: 's1',
      storyId: 'story-1',
      currentStage: 'Move' as const,
      currentMove: 'move-2',
      status: 'Running' as const,
      transitions: [],
      startedAt: '2026-08-19T00:00:00.000Z',
      completedAt: null,
      metadata: {
        title: 't',
        personalizedContextPackageId: null,
        behaviorEvaluationId: null,
        moduleIds: [],
        strategyId: 'basic',
        notes: 'n',
        status: 'Draft' as const,
      },
    };

    assert.equal(
      strategy.resolveNext(base, ['move-1', 'move-2', 'move-3'], 'next')
        .currentMove,
      'move-3',
    );
    assert.equal(
      strategy.resolveNext(base, ['move-1', 'move-2', 'move-3'], 'previous')
        .currentMove,
      'move-1',
    );
    assert.equal(
      strategy.resolveNext(
        base,
        ['move-1', 'move-2', 'move-3'],
        'jump',
        'move-1',
      ).currentMove,
      'move-1',
    );
  });
});

describe('RuntimeValidator', () => {
  it('flags running without move', () => {
    const validator = createRuntimeValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'e1',
      sessionId: 's1',
      storyId: 'story-1',
      currentStage: 'Boot',
      currentMove: null,
      status: 'Running',
      transitions: [
        {
          from: null,
          to: null,
          reason: 'start',
          timestamp: '2026-08-19T00:00:00.000Z',
          metadata: { notes: 'n', stage: 'Boot' },
        },
      ],
      startedAt: '2026-08-19T00:00:00.000Z',
      completedAt: null,
      metadata: {
        title: 't',
        personalizedContextPackageId: null,
        behaviorEvaluationId: null,
        moduleIds: [],
        strategyId: 'basic',
        notes: 'n',
        status: 'Draft',
      },
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'running-without-move'));
  });
});

describe('createExperienceRuntimeOrchestrator', () => {
  it('starts, navigates, validates and completes', () => {
    const orchestrator = createExperienceRuntimeOrchestrator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = orchestrator.start(sampleInput());
    assert.equal(pkg.execution.status, 'Running');
    assert.equal(pkg.execution.currentMove, 'move-1');
    assert.ok(
      orchestrator
        .getEvents(pkg.id)
        .some((event) => event.type === 'RuntimeStarted'),
    );

    const next = orchestrator.next(pkg.id);
    assert.equal(next.execution.currentMove, 'move-2');
    assert.ok(
      orchestrator
        .getEvents(pkg.id)
        .some((event) => event.type === 'RuntimeTransitioned'),
    );

    const jumped = orchestrator.jump(next.id, 'move-1');
    assert.equal(jumped.execution.currentMove, 'move-1');
    assert.equal(jumped.execution.currentStage, 'Jump');

    const previous = orchestrator.previous(jumped.id);
    assert.equal(previous.execution.currentMove, 'move-1');

    const validated = orchestrator.validate(previous.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      orchestrator
        .getEvents(previous.id)
        .some((event) => event.type === 'RuntimeValidated'),
    );

    const completed = orchestrator.complete(validated.id);
    assert.equal(completed.execution.status, 'Completed');
    assert.equal(completed.metadata.status, 'Published');
    assert.ok(
      orchestrator
        .getEvents(validated.id)
        .some((event) => event.type === 'RuntimeCompleted'),
    );
    assert.ok(orchestrator.getIndex().list(validated.id).length >= 1);
  });

  it('exposes API start/next/previous/jump/complete/list/validate', () => {
    const orchestrator = createExperienceRuntimeOrchestrator();
    const api = createExperienceRuntimeApi(orchestrator);
    const pkg = api.startRuntime(sampleInput());
    assert.ok(api.listRuntimeExecutions().length >= 1);
    const next = api.nextMove(pkg.id);
    assert.equal(next.execution.currentMove, 'move-2');
    const prev = api.previousMove(next.id);
    assert.equal(prev.execution.currentMove, 'move-1');
    const jumped = api.jumpToMove(prev.id, 'move-3');
    assert.equal(jumped.execution.currentMove, 'move-3');
    const validated = api.validateRuntime(jumped.id);
    assert.equal(validated.validation?.valid, true);
    const completed = api.completeRuntime(validated.id);
    assert.equal(completed.execution.status, 'Completed');
  });
});

describe('RuntimeIndex', () => {
  it('rebuilds index entries', () => {
    const index = createRuntimeIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        execution: {
          id: 'e1',
          sessionId: 's1',
          storyId: 'story-1',
          currentStage: 'Move',
          currentMove: 'move-1',
          status: 'Running',
          transitions: [],
          startedAt: '2026-08-19T00:00:00.000Z',
          completedAt: null,
          metadata: {
            title: 't',
            personalizedContextPackageId: null,
            behaviorEvaluationId: null,
            moduleIds: [],
            strategyId: 'basic',
            notes: 'n',
            status: 'Draft',
          },
        },
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('e1').length, 1);
  });
});
