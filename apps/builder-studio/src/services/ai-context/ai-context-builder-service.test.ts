import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BuildAIContextInput } from '../../model';
import { createAIContextApi } from './ai-context-api';
import { createAIContextBuilderService } from './ai-context-builder-service';
import { createContextComposer } from './context-composer';
import {
  DecisionContextSource,
  ExperienceContextSource,
  KnowledgeContextSource,
  ObjectContextSource,
} from './context-sources';

function sampleInput(): BuildAIContextInput {
  return {
    objectId: 'object-harmony-124',
    projectId: 'harmony-124',
    title: 'Harmony AI Context',
    objectPackage: {
      objectId: 'object-harmony-124',
      projectId: 'harmony-124',
      version: '1.0.0',
      metadata: {
        name: 'Harmony 124',
        objectType: 'house',
        location: 'Brno',
        status: 'Active',
        description: 'Demo house',
        tags: ['modular'],
      },
      modules: ['hero', 'priority', 'faq'],
    },
    experience: {
      experienceId: 'experience-object-harmony-124',
      version: '1.0.0',
      metadata: { title: 'Harmony Experience', description: 'Demo' },
      scenes: [
        {
          sceneId: 'scene-1',
          title: 'Explore',
          modules: ['hero', 'house-navigator'],
        },
      ],
      navigation: { defaultScene: 'scene-1', order: ['scene-1'] },
    },
    knowledge: {
      knowledgeId: 'knowledge-object-harmony-124',
      version: '1.0.0',
      facts: [
        {
          id: 'fact-1',
          title: 'Energie',
          value: 'A+',
          category: 'energy',
        },
      ],
      entities: [{ id: 'entity-1', type: 'system', label: 'TČ' }],
      faqs: [
        {
          id: 'faq-1',
          question: 'Jaké je vytápění?',
          answer: 'Tepelné čerpadlo.',
        },
      ],
      documents: [{ id: 'doc-1', title: 'TZ', type: 'pdf' }],
    },
    decision: {
      id: 'decision-object-harmony-124',
      version: '1.0.0',
      decisionRules: [
        {
          id: 'rule-1',
          condition: 'priority.includes(energy)',
          outcome: 'emphasize-energy',
          priority: 1,
          weight: 0.9,
        },
      ],
      decisionSignals: [
        {
          id: 'signal-1',
          source: 'priority',
          type: 'preference',
          label: 'Priority',
          importance: 1,
        },
      ],
      priorities: ['energy', 'layout'],
      strategies: [
        {
          id: 'strategy-1',
          title: 'Explore then Decide',
          description: 'Prohlídka, pak FAQ.',
          targetSignals: ['signal-1'],
        },
      ],
    },
  };
}

describe('AI Context sources and composer', () => {
  it('each source returns only its fragment', () => {
    const input = sampleInput();
    const object = ObjectContextSource.collect(input);
    const experience = ExperienceContextSource.collect(input);
    const knowledge = KnowledgeContextSource.collect(input);
    const decision = DecisionContextSource.collect(input);

    assert.equal(object?.type, 'object');
    assert.equal(experience?.type, 'experience');
    assert.equal(knowledge?.type, 'knowledge');
    assert.equal(decision?.type, 'decision');
    assert.equal(object?.payload.name, 'Harmony 124');
    assert.ok(Array.isArray(knowledge?.payload.facts));
  });

  it('composer merges, sorts and deduplicates', () => {
    const composer = createContextComposer();
    const input = sampleInput();
    const a = ObjectContextSource.collect(input)!;
    const b = ExperienceContextSource.collect(input)!;
    const composed = composer.compose([b, a, a, null]);
    assert.equal(composed.length, 2);
    assert.equal(composed[0]?.type, 'object');
    assert.equal(composed[1]?.type, 'experience');
  });
});

describe('createAIContextBuilderService', () => {
  it('builds AIContextPackage with four contexts and ContextBuilt event', () => {
    const builder = createAIContextBuilderService({
      now: () => new Date('2026-08-18T16:00:00.000Z'),
      createId: (prefix) => `${prefix}-c`,
    });

    const built = builder.build(sampleInput());
    assert.equal(built.id, 'ai-context-object-harmony-124');
    assert.equal(built.metadata.status, 'Built');
    assert.ok(built.objectContext);
    assert.ok(built.experienceContext);
    assert.ok(built.knowledgeContext);
    assert.ok(built.decisionContext);
    assert.equal(built.fragments.length, 4);
    assert.equal(builder.getEvents(built.id)[0]?.type, 'ContextBuilt');
  });

  it('refreshes, previews and clears context', () => {
    const builder = createAIContextBuilderService();
    const built = builder.build(sampleInput());
    const refreshed = builder.refresh(sampleInput());
    assert.notEqual(refreshed.version, built.version);
    assert.ok(
      builder
        .getEvents(built.id)
        .some((event) => event.type === 'ContextRefreshed'),
    );

    const preview = builder.preview(built.id);
    assert.ok(preview);
    assert.equal(preview?.id, built.id);

    const cleared = builder.clear(built.id);
    assert.equal(cleared?.metadata.status, 'Cleared');
    assert.equal(cleared?.fragments.length, 0);
    assert.ok(
      builder
        .getEvents(built.id)
        .some((event) => event.type === 'ContextCleared'),
    );
  });

  it('exposes AI Context API build/preview/refresh', () => {
    const builder = createAIContextBuilderService();
    const api = createAIContextApi(builder);

    const built = api.buildContext(sampleInput());
    assert.ok(api.previewContext(built.id));
    const refreshed = api.refreshContext(sampleInput());
    assert.equal(refreshed.id, built.id);
    assert.notEqual(refreshed.version, built.version);
  });
});
