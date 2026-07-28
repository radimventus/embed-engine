import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CreateRuntimeInput } from '../../model';
import { createDecisionRuntimeApi } from './decision-runtime-api';
import { createDecisionRuntime } from './decision-runtime';

function sampleInput(): CreateRuntimeInput {
  return {
    decisionModelId: 'decision-model-object-harmony-124',
    objectId: 'object-harmony-124',
    title: 'Harmony Runtime Model',
    knowledgeId: 'knowledge-object-harmony-124',
    decisionKnowledgeId: 'decision-object-harmony-124',
    experienceId: 'experience-object-harmony-124',
    learningId: 'learning-platform',
    graph: {
      nodes: [
        {
          id: 'node-priority-energy',
          type: 'priority',
          label: 'energy',
          sourceId: 'energy',
        },
        {
          id: 'node-rule-1',
          type: 'rule',
          label: 'emphasize-energy',
          sourceId: 'rule-1',
        },
      ],
      edges: [
        {
          id: 'edge-1',
          from: 'node-priority-energy',
          to: 'node-rule-1',
          relation: 'informs-rule',
        },
      ],
    },
  };
}

describe('createDecisionRuntime', () => {
  it('creates RuntimeModel in Initialized state with projected graph', () => {
    const runtime = createDecisionRuntime({
      now: () => new Date('2026-08-18T20:00:00.000Z'),
      createId: (prefix) => `${prefix}-r`,
    });

    const created = runtime.createRuntime(sampleInput());
    assert.equal(
      created.id,
      'runtime-decision-model-object-harmony-124',
    );
    assert.equal(created.status, 'Initialized');
    assert.equal(
      created.decisionModelId,
      'decision-model-object-harmony-124',
    );
    assert.equal(created.graph.nodes.length, 2);
    assert.equal(created.context.configuration.evaluateRules, false);
    assert.equal(
      runtime.getEvents(created.id)[0]?.type,
      'RuntimeCreated',
    );
  });

  it('validates to Ready and disposes runtime', () => {
    const runtime = createDecisionRuntime();
    const created = runtime.createRuntime(sampleInput());
    const validated = runtime.validateRuntime(created.id);
    assert.equal(validated.status, 'Ready');
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      runtime
        .getEvents(created.id)
        .some((event) => event.type === 'RuntimeValidated'),
    );

    const disposed = runtime.dispose(created.id);
    assert.equal(disposed.status, 'Disposed');
    assert.ok(
      runtime
        .getEvents(created.id)
        .some((event) => event.type === 'RuntimeDisposed'),
    );
  });

  it('exposes Runtime API create/load/preview', () => {
    const runtime = createDecisionRuntime();
    const api = createDecisionRuntimeApi(runtime);

    const created = api.createRuntime(sampleInput());
    assert.ok(api.loadRuntime(created.id));
    assert.ok(api.previewRuntime(created.id));
  });
});
