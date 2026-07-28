import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BuildDecisionModelInput } from '../../model';
import { createDecisionEngineApi } from './decision-engine-api';
import { createDecisionEngine } from './decision-engine';
import { createDecisionInputResolver } from './decision-input-resolver';
import { buildDecisionGraph } from './decision-graph-builder';

function sampleInput(): BuildDecisionModelInput {
  return {
    objectId: 'object-harmony-124',
    title: 'Harmony Decision Model',
    knowledgeId: 'knowledge-object-harmony-124',
    decisionKnowledgeId: 'decision-object-harmony-124',
    experienceId: 'experience-object-harmony-124',
    learningId: 'learning-platform',
    knowledgeFacts: [{ id: 'fact-energy', title: 'Energie' }],
    knowledgeFaqs: [{ id: 'faq-1', question: 'Jaké je vytápění?' }],
    priorities: ['energy', 'layout'],
    rules: [
      {
        id: 'rule-1',
        condition: 'priority.includes(energy)',
        outcome: 'emphasize-energy',
      },
    ],
    signals: [
      {
        id: 'signal-1',
        label: 'Priority',
        source: 'priority',
        type: 'preference',
      },
    ],
    scenes: [
      {
        sceneId: 'scene-1',
        title: 'Explore',
        modules: ['hero', 'priority'],
      },
    ],
  };
}

describe('DecisionInputResolver and DecisionGraph', () => {
  it('resolves inputs without evaluating them', () => {
    const resolver = createDecisionInputResolver();
    const resolved = resolver.resolveAll(sampleInput());
    assert.equal(resolved.knowledgePresent, true);
    assert.equal(resolved.decisionKnowledgePresent, true);
    assert.equal(resolved.learningId, 'learning-platform');
  });

  it('builds structural graph with node types', () => {
    const graph = buildDecisionGraph(sampleInput());
    assert.ok(graph.nodes.some((item) => item.type === 'knowledge'));
    assert.ok(graph.nodes.some((item) => item.type === 'priority'));
    assert.ok(graph.nodes.some((item) => item.type === 'rule'));
    assert.ok(graph.nodes.some((item) => item.type === 'signal'));
    assert.ok(graph.nodes.some((item) => item.type === 'experience'));
    assert.ok(graph.edges.length >= 1);
  });
});

describe('createDecisionEngine', () => {
  it('creates DecisionModel and emits create/graph events', () => {
    const engine = createDecisionEngine({
      now: () => new Date('2026-08-18T19:00:00.000Z'),
      createId: (prefix) => `${prefix}-e`,
    });

    const created = engine.createDecisionModel(sampleInput());
    assert.equal(created.id, 'decision-model-object-harmony-124');
    assert.equal(created.knowledge, 'knowledge-object-harmony-124');
    assert.equal(created.decisionKnowledge, 'decision-object-harmony-124');
    assert.ok(created.graph.nodes.length > 0);
    assert.equal(
      engine.getEvents(created.id)[1]?.type,
      'DecisionModelCreated',
    );
    assert.equal(engine.getEvents(created.id)[0]?.type, 'DecisionGraphBuilt');
  });

  it('validates and disposes DecisionModel', () => {
    const engine = createDecisionEngine();
    const created = engine.createDecisionModel(sampleInput());
    const validated = engine.validateDecisionModel(created.id);
    assert.ok(validated.validation);
    assert.equal(validated.validation?.valid, true);
    assert.equal(validated.metadata.status, 'Validated');
    assert.ok(
      engine
        .getEvents(created.id)
        .some((event) => event.type === 'DecisionModelValidated'),
    );

    const disposed = engine.dispose(created.id);
    assert.equal(disposed.metadata.status, 'Disposed');
  });

  it('exposes Decision Engine API build/validate/preview', () => {
    const engine = createDecisionEngine();
    const api = createDecisionEngineApi(engine);

    const built = api.buildDecisionModel(sampleInput());
    const validation = api.validateDecision(built.id);
    assert.equal(validation.valid, true);
    const graph = api.previewDecisionGraph(built.id);
    assert.ok(graph);
    assert.ok(graph!.nodes.length > 0);
  });
});
