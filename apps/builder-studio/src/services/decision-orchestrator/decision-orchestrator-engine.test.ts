import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { StartExecutionInput } from '../../model';
import {
  createBasicDecisionFlowStrategy,
  createDecisionExecutionValidator,
} from './basic-decision-flow-strategy';
import { createDecisionOrchestratorApi } from './decision-orchestrator-api';
import { createDecisionOrchestrator } from './decision-orchestrator';
import { createDecisionExecutionIndex } from './decision-execution-index';

function sampleInput(): StartExecutionInput {
  return {
    sessionId: 'runtime-session-1',
    storyId: 'decision-story-1',
    moveIds: ['move-1', 'move-2', 'move-3'],
    title: 'Demo Decision Execution',
    personalizationPackageId: 'personalization-package-1',
    behaviorEvaluationId: 'behavior-evaluation-1',
    experienceId: 'experience-1',
  };
}

describe('BasicDecisionFlowStrategy', () => {
  it('advances sequentially and detects completion', () => {
    const strategy = createBasicDecisionFlowStrategy();
    assert.equal(strategy.supports(sampleInput()), true);

    const first = strategy.next(
      {
        id: 'e1',
        sessionId: 's1',
        storyId: 'story-1',
        currentMove: null,
        state: 'Running',
        stages: [],
        startedAt: '2026-08-19T00:00:00.000Z',
        completedAt: null,
        metadata: {
          title: 't',
          personalizationPackageId: null,
          behaviorEvaluationId: null,
          experienceId: null,
          strategyId: 'basic',
          notes: 'n',
          status: 'Draft',
        },
      },
      ['move-1', 'move-2'],
    );
    assert.equal(first.currentMove, 'move-1');
    assert.equal(first.completed, false);

    const last = strategy.next(
      {
        id: 'e1',
        sessionId: 's1',
        storyId: 'story-1',
        currentMove: 'move-2',
        state: 'Running',
        stages: [],
        startedAt: '2026-08-19T00:00:00.000Z',
        completedAt: null,
        metadata: {
          title: 't',
          personalizationPackageId: null,
          behaviorEvaluationId: null,
          experienceId: null,
          strategyId: 'basic',
          notes: 'n',
          status: 'Draft',
        },
      },
      ['move-1', 'move-2'],
    );
    assert.equal(last.completed, true);
  });
});

describe('DecisionExecutionValidator', () => {
  it('flags running without move', () => {
    const validator = createDecisionExecutionValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'e1',
      sessionId: 's1',
      storyId: 'story-1',
      currentMove: null,
      state: 'Running',
      stages: [
        {
          id: 'stage-1',
          type: 'Boot',
          status: 'Active',
          startedAt: '2026-08-19T00:00:00.000Z',
          completedAt: null,
          metadata: { notes: 'n', moveId: null },
        },
      ],
      startedAt: '2026-08-19T00:00:00.000Z',
      completedAt: null,
      metadata: {
        title: 't',
        personalizationPackageId: null,
        behaviorEvaluationId: null,
        experienceId: null,
        strategyId: 'basic',
        notes: 'n',
        status: 'Draft',
      },
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'running-without-move'));
  });
});

describe('createDecisionOrchestrator', () => {
  it('starts, advances, validates and completes', () => {
    const orchestrator = createDecisionOrchestrator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = orchestrator.start(sampleInput());
    assert.equal(pkg.execution.state, 'Running');
    assert.equal(pkg.execution.currentMove, 'move-1');
    assert.ok(
      orchestrator
        .getEvents(pkg.id)
        .some((event) => event.type === 'DecisionExecutionStarted'),
    );
    assert.ok(
      orchestrator
        .getEvents(pkg.id)
        .some((event) => event.type === 'DecisionStageChanged'),
    );

    const advanced = orchestrator.advance(pkg.id);
    assert.equal(advanced.execution.currentMove, 'move-2');

    const transitioned = orchestrator.transition(advanced.id);
    assert.equal(transitioned.execution.currentMove, 'move-3');
    assert.ok(
      transitioned.execution.stages.some(
        (stage) => stage.type === 'Transition',
      ),
    );

    const validated = orchestrator.validate(transitioned.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      orchestrator
        .getEvents(transitioned.id)
        .some((event) => event.type === 'DecisionExecutionValidated'),
    );

    const completed = orchestrator.complete(validated.id);
    assert.equal(completed.execution.state, 'Completed');
    assert.equal(completed.metadata.status, 'Published');
    assert.ok(
      orchestrator
        .getEvents(validated.id)
        .some((event) => event.type === 'DecisionExecutionCompleted'),
    );
    assert.ok(orchestrator.getIndex().list(validated.id).length >= 1);
  });

  it('exposes API start/advance/complete/list/validate', () => {
    const orchestrator = createDecisionOrchestrator();
    const api = createDecisionOrchestratorApi(orchestrator);
    const pkg = api.startExecution(sampleInput());
    assert.ok(api.listExecutions().length >= 1);
    const advanced = api.advanceExecution(pkg.id);
    assert.equal(advanced.execution.currentMove, 'move-2');
    const validated = api.validateExecution(advanced.id);
    assert.equal(validated.validation?.valid, true);
    const completed = api.completeExecution(validated.id);
    assert.equal(completed.execution.state, 'Completed');
  });
});

describe('DecisionExecutionIndex', () => {
  it('rebuilds index entries', () => {
    const index = createDecisionExecutionIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        execution: {
          id: 'e1',
          sessionId: 's1',
          storyId: 'story-1',
          currentMove: 'move-1',
          state: 'Running',
          stages: [],
          startedAt: '2026-08-19T00:00:00.000Z',
          completedAt: null,
          metadata: {
            title: 't',
            personalizationPackageId: null,
            behaviorEvaluationId: null,
            experienceId: null,
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
