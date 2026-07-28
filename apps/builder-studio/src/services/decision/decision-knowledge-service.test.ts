import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createDecisionKnowledgeApi } from './decision-knowledge-api';
import { createDecisionKnowledgeService } from './decision-knowledge-service';
import { listPriorities, PRIORITY_REGISTRY } from './priority-registry';

describe('createDecisionKnowledgeService', () => {
  it('creates Decision Knowledge Package with seeded rules, signals, priorities', () => {
    const decision = createDecisionKnowledgeService({
      now: () => new Date('2026-08-18T15:00:00.000Z'),
      createId: (prefix) => `${prefix}-d`,
    });

    const created = decision.create({
      objectId: 'object-harmony-124',
      title: 'Harmony Decision Knowledge',
    });

    assert.equal(created.id, 'decision-object-harmony-124');
    assert.equal(created.objectId, 'object-harmony-124');
    assert.equal(created.version, '1.0.0');
    assert.ok(created.decisionRules.length >= 2);
    assert.ok(created.decisionSignals.some((item) => item.source === 'faq'));
    assert.ok(created.decisionSignals.some((item) => item.source === 'ai'));
    assert.ok(created.priorities.includes('energy'));
    assert.ok(created.strategies.length >= 1);
    assert.ok(
      decision
        .getEvents(created.id)
        .some((event) => event.type === 'PriorityRegistered'),
    );
  });

  it('adds rules, signals, strategies and registers priorities', () => {
    const decision = createDecisionKnowledgeService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = decision.create({
      objectId: 'object-family-98',
      title: 'Family Decision',
    });

    assert.equal(created.decisionRules.length, 0);

    const withRule = decision.addRule(created.id, {
      condition: 'priority.includes(privacy)',
      outcome: 'highlight-privacy',
      priority: 1,
      weight: 0.8,
    });
    assert.ok(
      withRule.decisionRules.some((item) => item.outcome === 'highlight-privacy'),
    );
    assert.ok(
      decision.getEvents(created.id).some((event) => event.type === 'RuleAdded'),
    );

    const withSignal = decision.addSignal(created.id, {
      source: 'form',
      label: 'Lead form',
      type: 'constraint',
    });
    assert.ok(
      withSignal.decisionSignals.some((item) => item.label === 'Lead form'),
    );
    assert.ok(
      decision
        .getEvents(created.id)
        .some((event) => event.type === 'SignalAdded'),
    );

    const withStrategy = decision.addStrategy(created.id, {
      title: 'Clarify then Commit',
      description: 'FAQ a formulář před AI.',
      targetSignals: withSignal.decisionSignals.map((item) => item.id),
    });
    assert.ok(
      withStrategy.strategies.some((item) => item.title === 'Clarify then Commit'),
    );
    assert.ok(
      decision
        .getEvents(created.id)
        .some((event) => event.type === 'StrategyAdded'),
    );

    const withPriority = decision.registerPriority(created.id, 'privacy');
    assert.ok(withPriority.priorities.includes('privacy'));
    assert.ok(
      decision
        .getEvents(created.id)
        .some((event) => event.type === 'PriorityRegistered'),
    );
  });

  it('exposes Decision API load/save/update and archive', () => {
    const decision = createDecisionKnowledgeService();
    const api = createDecisionKnowledgeApi(decision);

    const created = decision.create({
      objectId: 'object-villa-168',
      title: 'Villa Decision',
    });
    const loaded = api.loadDecisionKnowledge(created.id);
    assert.ok(loaded);

    const updated = api.updateDecisionKnowledge(created.id, {
      description: 'Autorský model rozhodovacích znalostí',
    });
    assert.equal(
      updated.metadata.description,
      'Autorský model rozhodovacích znalostí',
    );

    const saved = api.saveDecisionKnowledge(created.id);
    assert.notEqual(saved.version, created.version);

    const archived = decision.archive(created.id);
    assert.equal(archived.metadata.status, 'Archived');
  });

  it('exposes Priority Registry catalog', () => {
    assert.equal(PRIORITY_REGISTRY.length, 10);
    assert.equal(listPriorities().length, 10);
    assert.ok(PRIORITY_REGISTRY.some((item) => item.id === 'operating-costs'));
    assert.ok(PRIORITY_REGISTRY.some((item) => item.label === 'Land'));
  });
});
