import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from '../asset-service';
import { createKnowledgeApi } from './knowledge-api';
import { createKnowledgeService } from './knowledge-service';

describe('createKnowledgeService', () => {
  it('creates Knowledge Package with seeded facts, entities, FAQ', () => {
    const knowledge = createKnowledgeService({
      now: () => new Date('2026-08-18T14:00:00.000Z'),
      createId: (prefix) => `${prefix}-k`,
    });

    const created = knowledge.createKnowledge({
      objectId: 'object-harmony-124',
      title: 'Harmony Knowledge',
    });

    assert.equal(created.knowledgeId, 'knowledge-object-harmony-124');
    assert.ok(created.facts.length >= 3);
    assert.ok(created.entities.some((item) => item.label === 'Tepelné čerpadlo'));
    assert.ok(created.faqs.length >= 1);
    assert.ok(created.relationships.length >= 1);
    assert.equal(
      knowledge.getEvents(created.knowledgeId)[0]?.type,
      'KnowledgeCreated',
    );
  });

  it('adds facts, entities, relationships, FAQ and registers documents', () => {
    const knowledge = createKnowledgeService({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const created = knowledge.createKnowledge({
      objectId: 'object-family-98',
      title: 'Family Knowledge',
    });

    const withFact = knowledge.addFact(created.knowledgeId, {
      title: 'Konstrukce',
      value: 'Sendvičový panel',
      category: 'construction',
    });
    assert.ok(withFact.facts.some((item) => item.title === 'Konstrukce'));
    assert.ok(
      knowledge
        .getEvents(created.knowledgeId)
        .some((event) => event.type === 'FactAdded'),
    );

    const withEntity = knowledge.addEntity(created.knowledgeId, {
      label: 'Terasa',
      type: 'space',
    });
    assert.ok(withEntity.entities.some((item) => item.label === 'Terasa'));

    const entityId = withEntity.entities[0]!.id;
    const factId = withEntity.facts[0]!.id;
    const withRel = knowledge.addRelationship(created.knowledgeId, {
      from: entityId,
      to: factId,
      relation: 'describes',
      confidence: 0.7,
    });
    assert.equal(withRel.relationships.at(-1)?.relation, 'describes');

    const withFaq = knowledge.addFaq(created.knowledgeId, {
      question: 'Kolik má dům místností?',
      answer: 'Dispozice je 4+kk.',
      relatedEntities: [entityId],
    });
    assert.ok(withFaq.faqs.some((item) => item.question.includes('místností')));

    const withDoc = knowledge.registerDocument(created.knowledgeId, {
      title: 'Technická zpráva',
      assetRef: 'asset-pdf-1',
      type: 'pdf',
    });
    assert.ok(
      withDoc.documents.some((item) => item.assetRef === 'asset-pdf-1'),
    );
    assert.ok(
      knowledge
        .getEvents(created.knowledgeId)
        .some((event) => event.type === 'DocumentRegistered'),
    );
  });

  it('syncs documents from Active Project knowledge assets', () => {
    const assets = createAssetService();
    const project = assets.getActiveProject('harmony-124');
    assert.ok(project);

    const knowledge = createKnowledgeService();
    const created = knowledge.createKnowledge({
      objectId: 'object-harmony-124',
    });
    const synced = knowledge.syncDocumentsFromProject(
      created.knowledgeId,
      project,
    );
    assert.ok(synced.documents.length > 0);
  });

  it('exposes Knowledge API load/save/update and archive', () => {
    const knowledge = createKnowledgeService();
    const api = createKnowledgeApi(knowledge);

    const created = knowledge.createKnowledge({
      objectId: 'object-villa-168',
      title: 'Villa Knowledge',
    });
    const loaded = api.loadKnowledge(created.knowledgeId);
    assert.ok(loaded);

    const updated = api.updateKnowledge(created.knowledgeId, {
      description: 'Autorský model znalostí',
    });
    assert.equal(updated.metadata.description, 'Autorský model znalostí');

    const saved = api.saveKnowledge(created.knowledgeId);
    assert.notEqual(saved.version, created.version);

    const archived = knowledge.archiveKnowledge(created.knowledgeId);
    assert.equal(archived.metadata.status, 'Archived');
  });
});
