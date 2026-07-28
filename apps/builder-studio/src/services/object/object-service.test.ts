import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createAssetService } from '../asset-service';
import {
  DEFAULT_OBJECT_MODULES,
  listObjectModules,
} from './module-registry';
import { createObjectApi } from './object-api';
import { createObjectService } from './object-service';

describe('ModuleRegistry', () => {
  it('exposes catalog modules without configuration', () => {
    const modules = listObjectModules();
    assert.equal(modules.length, 7);
    assert.ok(modules.some((item) => item.id === 'hero'));
    assert.ok(modules.some((item) => item.id === 'ai-advisor'));
    assert.ok(modules.some((item) => item.id === 'lead-capture'));
  });
});

describe('createObjectService', () => {
  it('creates, updates, assigns modules and archives Object Package', () => {
    const objects = createObjectService({
      now: () => new Date('2026-08-18T10:00:00.000Z'),
      createId: (prefix) => `${prefix}-1`,
    });

    const created = objects.createObject({
      projectId: 'harmony-124',
      name: 'Harmony 124',
      location: 'Praha',
      tags: ['modular'],
    });

    assert.equal(created.objectId, 'object-harmony-124');
    assert.equal(created.metadata.name, 'Harmony 124');
    assert.deepEqual([...created.modules], [...DEFAULT_OBJECT_MODULES]);
    assert.equal(objects.getEvents(created.objectId)[0]?.type, 'ObjectCreated');

    const updated = objects.updateObject(created.objectId, {
      description: 'Rodinný dům',
      tags: ['modular', 'family'],
    });
    assert.equal(updated.metadata.description, 'Rodinný dům');
    assert.equal(updated.version, '1.0.1');
    assert.ok(
      objects
        .getEvents(created.objectId)
        .some((event) => event.type === 'MetadataChanged'),
    );

    const withModule = objects.assignModule(created.objectId, 'ai-advisor');
    assert.ok(withModule.modules.includes('ai-advisor'));
    assert.ok(
      objects
        .getEvents(created.objectId)
        .some((event) => event.type === 'ModuleAssigned'),
    );

    const archived = objects.archiveObject(created.objectId);
    assert.equal(archived.metadata.status, 'Archived');
  });

  it('syncs media/layout/knowledge from Active Project assets', () => {
    const assets = createAssetService();
    const project = assets.getActiveProject('harmony-124');
    assert.ok(project);

    const objects = createObjectService();
    const created = objects.createObject({
      projectId: 'harmony-124',
      name: project.record.name,
    });
    const synced = objects.syncContentFromProject(created.objectId, project);

    assert.ok(synced.media.photographs.length > 0);
    assert.ok(synced.layouts.svg.length + synced.layouts.floorplan.length > 0);
    assert.ok(synced.knowledge.length > 0);
  });

  it('duplicates Object Package and exposes public Object API', () => {
    const objects = createObjectService({
      createId: (prefix) => `${prefix}-dup`,
    });
    const api = createObjectApi(objects);

    objects.createObject({
      projectId: 'family-98',
      name: 'Family 98',
    });
    const loaded = api.loadObject('object-family-98');
    assert.ok(loaded);

    const saved = api.saveObject('object-family-98');
    assert.equal(saved.version, '1.0.1');

    const copy = api.duplicateObject('object-family-98');
    assert.notEqual(copy.objectId, 'object-family-98');
    assert.equal(copy.metadata.name, 'Family 98 Copy');
    assert.equal(copy.metadata.status, 'Draft');
    assert.equal(
      objects.loadObjectByProject('family-98')?.objectId,
      'object-family-98',
    );
  });
});
