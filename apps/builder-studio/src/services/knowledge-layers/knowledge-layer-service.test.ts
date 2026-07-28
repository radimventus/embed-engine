import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createKnowledgeService } from '../knowledge/knowledge-service';
import { createKnowledgeContextResolver } from './knowledge-context-resolver';
import { createKnowledgeLayerApi } from './knowledge-layer-api';
import { createKnowledgeLayerService } from './knowledge-layer-service';
import {
  KNOWLEDGE_LAYER_REGISTRY,
  listKnowledgeLayers,
} from './knowledge-layer-registry';

describe('Knowledge Layer Registry', () => {
  it('exposes Platform, Company, Object, Session', () => {
    assert.equal(KNOWLEDGE_LAYER_REGISTRY.length, 4);
    assert.deepEqual(
      listKnowledgeLayers().map((item) => item.id),
      ['platform', 'company', 'object', 'session'],
    );
  });
});

describe('createKnowledgeLayerService', () => {
  it('registers layer models without transferring data', () => {
    const layers = createKnowledgeLayerService({
      now: () => new Date('2026-08-18T17:00:00.000Z'),
      createId: (prefix) => `${prefix}-l`,
    });

    const bundle = layers.ensureLayers({
      companyId: 'partner-ac-modular',
      companyName: 'AC Modular',
      objectId: 'object-harmony-124',
      objectName: 'Harmony 124',
    });

    assert.equal(bundle.platform.layer, 'platform');
    assert.equal(bundle.company.layer, 'company');
    assert.equal(bundle.object.layer, 'object');
    assert.equal(bundle.session.layer, 'session');
    assert.ok(
      layers
        .getEvents()
        .every((event) => event.type === 'LayerRegistered'),
    );
    assert.equal(layers.getEvents().length, 4);
  });

  it('attaches and removes Knowledge References without copying layer data', () => {
    const knowledge = createKnowledgeService();
    const layers = createKnowledgeLayerService({
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
    });
    const bundle = layers.ensureLayers({
      companyId: 'partner-ac-modular',
      companyName: 'AC Modular',
      objectId: 'object-family-98',
      objectName: 'Family 98',
    });

    const attached = layers.attachReference(created, {
      layer: 'platform',
      targetId: bundle.platform.id,
      type: 'catalog',
    });
    const withCompany = layers.attachReference(attached.knowledge, {
      layer: 'company',
      targetId: bundle.company.id,
      type: 'policy',
    });
    const withObject = layers.attachReference(withCompany.knowledge, {
      layer: 'object',
      targetId: bundle.object.id,
      type: 'fact',
    });
    const withSession = layers.attachReference(withObject.knowledge, {
      layer: 'session',
      targetId: bundle.session.id,
      type: 'other',
    });

    const saved = knowledge.upsertKnowledge(withSession.knowledge);
    assert.equal(saved.references.length, 4);
    assert.ok(
      layers
        .getEvents()
        .some((event) => event.type === 'LayerReferenceAdded'),
    );

    const removed = layers.detachReference(
      saved,
      saved.references[0]!.id,
    );
    knowledge.upsertKnowledge(removed);
    assert.equal(removed.references.length, 3);
    assert.ok(
      layers
        .getEvents()
        .some((event) => event.type === 'LayerReferenceRemoved'),
    );
  });

  it('resolver returns references only — no AI Context', () => {
    const layers = createKnowledgeLayerService();
    const resolver = createKnowledgeContextResolver();
    const api = createKnowledgeLayerApi(layers, resolver);

    assert.equal(api.listLayers().length, 4);

    const bundle = layers.ensureLayers({
      companyId: 'partner-ac-modular',
      companyName: 'AC Modular',
      objectId: 'object-villa-168',
      objectName: 'Villa 168',
    });

    const references = [
      {
        id: 'kref-1',
        layer: 'platform' as const,
        targetId: bundle.platform.id,
        type: 'catalog' as const,
      },
      {
        id: 'kref-2',
        layer: 'object' as const,
        targetId: bundle.object.id,
        type: 'fact' as const,
      },
    ];

    const platform = api.resolveLayer('platform', references);
    assert.equal(platform.layer, 'platform');
    assert.equal(platform.references.length, 1);
    assert.equal(platform.layerModel?.id, bundle.platform.id);

    const objectResolved = resolver.resolveObject(
      references,
      bundle.object,
    );
    assert.equal(objectResolved.references[0]?.targetId, bundle.object.id);

    assert.ok(api.loadLayer('platform'));
  });
});
