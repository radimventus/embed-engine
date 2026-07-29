import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { BuildObjectPublicationInput } from '../../model';
import {
  createBasicPublicationStrategy,
  createPublicationValidator,
} from './basic-publication-strategy';
import { createObjectPublicationApi } from './object-publication-api';
import { createObjectPublicationPipeline } from './object-publication-pipeline';
import { createPublicationIndex } from './publication-index';

function sampleBuild(
  overrides: Partial<BuildObjectPublicationInput> = {},
): BuildObjectPublicationInput {
  return {
    objectId: 'object-house-1',
    objectVersion: '1.0.0',
    title: 'Demo House',
    runtimeVersion: '1.0.0',
    contractVersion: '1.0.0',
    compatibilityVersion: '1.0.0',
    sourceProjectId: 'project-1',
    ...overrides,
  };
}

describe('BasicPublicationStrategy', () => {
  it('builds Object Package with manifest and checksum', () => {
    const strategy = createBasicPublicationStrategy();
    const built = strategy.build(
      sampleBuild(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(built.objectId, 'object-house-1');
    assert.equal(built.manifest.runtimeVersion, '1.0.0');
    assert.ok(built.checksum.startsWith('chk-'));
    assert.equal(strategy.publish(built).objectId, 'object-house-1');
  });
});

describe('PublicationValidator', () => {
  it('flags empty assets', () => {
    const validator = createPublicationValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      objectPackage: {
        id: 'op1',
        objectId: 'o1',
        version: '1.0.0',
        manifest: {
          id: 'm1',
          objectVersion: '1.0.0',
          runtimeVersion: '1.0.0',
          contractVersion: '1.0.0',
          compatibilityVersion: '1.0.0',
          generatedAt: '2026-08-19T00:00:00.000Z',
        },
        assets: [],
        metadata: {
          title: 't',
          notes: 'n',
          sourceObjectId: 'o1',
          sourceProjectId: 'pr1',
        },
        checksum: 'chk-1',
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Built',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(result.issues.some((item) => item.code === 'assets-empty'));
  });
});

describe('createObjectPublicationPipeline', () => {
  it('builds, validates and publishes', () => {
    const pipeline = createObjectPublicationPipeline({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = pipeline.initialize({
      sessionId: 'publication-session-1',
      title: 'Demo Publication',
      build: sampleBuild(),
    });
    assert.equal(pkg.metadata.status, 'Built');
    assert.ok(
      pipeline
        .getEvents()
        .some((event) => event.type === 'ObjectPublicationCreated'),
    );

    const validation = pipeline.validate(pkg.id);
    assert.equal(validation.valid, true);
    assert.ok(
      pipeline
        .getEvents()
        .some((event) => event.type === 'ObjectPublicationValidated'),
    );

    const published = pipeline.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(pipeline.listPublishedObjects().length, 1);
    assert.equal(
      pipeline.findPublishedObject('object-house-1')?.objectId,
      'object-house-1',
    );
    assert.ok(
      pipeline
        .getEvents()
        .some((event) => event.type === 'ObjectPublicationPublished'),
    );
  });

  it('emits failed when validation cannot run before build', () => {
    const pipeline = createObjectPublicationPipeline();
    const pkg = pipeline.initialize({
      sessionId: 's1',
      title: 'Empty',
    });
    const validation = pipeline.validate(pkg.id);
    assert.equal(validation.valid, false);
    assert.ok(
      pipeline
        .getEvents()
        .some((event) => event.type === 'ObjectPublicationFailed'),
    );
  });
});

describe('PublicationIndex', () => {
  it('indexes published packages', () => {
    const index = createPublicationIndex();
    const pipeline = createObjectPublicationPipeline();
    const pkg = pipeline.initialize({
      sessionId: 's1',
      build: sampleBuild(),
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('object-house-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createObjectPublicationApi', () => {
  it('exposes build / publish / list / find / validate', () => {
    const api = createObjectPublicationApi();
    const created = api.buildObjectPublication(null, sampleBuild(), {
      sessionId: 'publication-session-1',
      title: 'API Publication',
    });
    assert.equal(created.objectPackage.objectId, 'object-house-1');
    const validated = api.validatePublication(created.id);
    assert.equal(validated.valid, true);
    const published = api.publishObject(created.id);
    assert.equal(published.metadata.status, 'Published');
    assert.equal(api.listPublishedObjects().length, 1);
    assert.equal(
      api.findPublishedObject('object-house-1')?.version,
      '1.0.0',
    );
  });
});
