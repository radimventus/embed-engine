import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { ComposeStoryInput } from '../../model';
import { createDecisionStoryApi } from './decision-story-api';
import { createDecisionStoryComposer } from './decision-story-composer';
import {
  buildStoryGraph,
  composeMovesFromEvaluation,
  createStoryValidator,
} from './story-validator';

function sampleInput(): ComposeStoryInput {
  return {
    decisionModelId: 'decision-model-object-harmony-124',
    evaluationId: 'evaluation-decision-model-object-harmony-124',
    title: 'Harmony Decision Story',
    ruleResults: [
      {
        ruleId: 'rule-1',
        status: 'Passed',
        score: 0.9,
        matchedSignals: ['signal-priority'],
        reason: 'Matched energy priority.',
        condition: 'priority.includes(energy)',
        outcome: 'emphasize-energy',
      },
      {
        ruleId: 'rule-2',
        status: 'Failed',
        score: 0,
        matchedSignals: [],
        reason: 'Privacy not selected.',
        condition: 'priority.includes(privacy)',
        outcome: 'highlight-privacy',
      },
    ],
    evaluationSummary: {
      passed: 1,
      failed: 1,
      skipped: 0,
      averageScore: 0.45,
    },
  };
}

describe('Story composition helpers', () => {
  it('builds moves and sequential story graph', () => {
    let n = 0;
    const moves = composeMovesFromEvaluation(sampleInput(), (prefix) => {
      n += 1;
      return `${prefix}-${n}`;
    });
    assert.ok(moves.some((item) => item.type === 'insight'));
    assert.ok(moves.some((item) => item.type === 'recommendation'));
    assert.ok(moves.some((item) => item.type === 'action'));
    assert.ok(moves.some((item) => item.type === 'summary'));

    const graph = buildStoryGraph(moves);
    assert.equal(graph.nodes.length, moves.length);
    assert.equal(graph.edges.length, Math.max(0, moves.length - 1));
  });

  it('validates story structure', () => {
    const validator = createStoryValidator({
      now: () => new Date('2026-08-18T22:00:00.000Z'),
    });
    const composer = createDecisionStoryComposer({
      now: () => new Date('2026-08-18T22:00:00.000Z'),
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });
    const story = composer.compose(sampleInput());
    const validation = validator.validate(story);
    assert.equal(validation.valid, true);
  });
});

describe('createDecisionStoryComposer', () => {
  it('composes story and emits StoryComposed / MoveAdded', () => {
    const composer = createDecisionStoryComposer({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const story = composer.compose(sampleInput());
    assert.equal(
      story.id,
      'story-evaluation-decision-model-object-harmony-124',
    );
    assert.ok(story.moves.length >= 4);
    assert.ok(
      composer
        .getEvents(story.id)
        .some((event) => event.type === 'StoryComposed'),
    );
    assert.ok(
      composer.getEvents(story.id).some((event) => event.type === 'MoveAdded'),
    );
  });

  it('validates via API and supports preview/dispose', () => {
    const composer = createDecisionStoryComposer();
    const api = createDecisionStoryApi(composer);
    const story = api.composeStory(sampleInput());
    const validation = api.validateStory(story.id);
    assert.equal(validation.valid, true);
    assert.ok(api.previewStory(story.id));
    assert.ok(
      composer
        .getEvents(story.id)
        .some((event) => event.type === 'StoryValidated'),
    );
    composer.dispose(story.id);
    assert.equal(composer.load(story.id), null);
  });
});
