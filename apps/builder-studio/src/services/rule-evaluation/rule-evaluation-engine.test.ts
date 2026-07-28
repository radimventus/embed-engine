import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { RuleEvaluationInput } from '../../model';
import { createBasicRuleEvaluator } from './basic-rule-evaluator';
import { createRuleEvaluationApi } from './rule-evaluation-api';
import { createRuleEvaluationEngine } from './rule-evaluation-engine';

function sampleInput(): RuleEvaluationInput {
  return {
    decisionModelId: 'decision-model-object-harmony-124',
    objectId: 'object-harmony-124',
    title: 'Harmony Rule Evaluation',
    context: {
      knowledge: {
        knowledgeId: 'knowledge-object-harmony-124',
        factIds: ['fact-energy'],
        faqIds: ['faq-1'],
      },
      decisionKnowledge: {
        decisionKnowledgeId: 'decision-object-harmony-124',
        ruleIds: ['rule-1', 'rule-2'],
      },
      signals: [
        {
          id: 'signal-priority',
          source: 'priority',
          label: 'Priority',
          type: 'preference',
          importance: 1,
        },
        {
          id: 'signal-navigation',
          source: 'navigation',
          label: 'Navigation',
          type: 'intent',
          importance: 0.7,
        },
      ],
      priorities: ['energy', 'layout'],
      metadata: {
        objectId: 'object-harmony-124',
        notes: 'Test context',
      },
    },
    rules: [
      {
        id: 'rule-1',
        condition: 'priority.includes(energy)',
        outcome: 'emphasize-energy',
        priority: 1,
        weight: 0.9,
      },
      {
        id: 'rule-2',
        condition: 'signal.navigation.active',
        outcome: 'open-house-navigator',
        priority: 2,
        weight: 0.7,
      },
      {
        id: 'rule-3',
        condition: 'priority.includes(privacy)',
        outcome: 'highlight-privacy',
        priority: 3,
        weight: 0.5,
      },
    ],
  };
}

describe('BasicRuleEvaluator', () => {
  it('passes rules that match priorities or signals', () => {
    const evaluator = createBasicRuleEvaluator();
    const input = sampleInput();
    const passed = evaluator.evaluate(input.rules[0]!, input.context);
    assert.equal(passed.status, 'Passed');
    assert.ok(passed.score > 0);

    const signalPass = evaluator.evaluate(input.rules[1]!, input.context);
    assert.equal(signalPass.status, 'Passed');
    assert.ok(signalPass.matchedSignals.includes('signal-navigation'));

    const failed = evaluator.evaluate(input.rules[2]!, input.context);
    assert.equal(failed.status, 'Failed');
  });
});

describe('createRuleEvaluationEngine', () => {
  it('evaluates rules and emits lifecycle events', () => {
    const engine = createRuleEvaluationEngine({
      now: () => new Date('2026-08-18T21:00:00.000Z'),
      createId: (prefix) => `${prefix}-e`,
    });

    const result = engine.evaluate(sampleInput());
    assert.equal(result.decisionModelId, 'decision-model-object-harmony-124');
    assert.equal(result.ruleResults.length, 3);
    assert.equal(result.summary.passed, 2);
    assert.equal(result.summary.failed, 1);
    assert.equal(
      engine.getEvents(result.id).at(-1)?.type,
      'EvaluationStarted',
    );
    assert.equal(engine.getEvents(result.id)[0]?.type, 'EvaluationCompleted');
    assert.ok(
      engine
        .getEvents(result.id)
        .some((event) => event.type === 'RuleEvaluated'),
    );
  });

  it('validates rules and supports dispose/preview API', () => {
    const engine = createRuleEvaluationEngine();
    const api = createRuleEvaluationApi(engine);
    const input = sampleInput();

    const validation = api.validateEvaluation(input);
    assert.equal(validation.valid, true);

    const empty = api.validateEvaluation({
      ...input,
      rules: [],
    });
    assert.equal(empty.valid, false);

    const evaluated = api.evaluateRules(input);
    assert.ok(api.previewEvaluation(evaluated.id));
    engine.dispose(evaluated.id);
    assert.equal(engine.load(evaluated.id), null);
  });
});
