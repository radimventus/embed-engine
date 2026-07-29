import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CollectManifestInput } from '../../model';
import {
  createBasicRuntimeManifestStrategy,
  createRuntimeManifestValidator,
} from './basic-runtime-manifest-strategy';
import { createRuntimeManifestApi } from './runtime-manifest-api';
import { createRuntimeManifestEngine } from './runtime-manifest-engine';
import { createRuntimeManifestIndex } from './runtime-manifest-index';

function sampleInput(
  overrides: Partial<CollectManifestInput> = {},
): CollectManifestInput {
  return {
    sessionId: 'runtime-session-1',
    title: 'Demo Manifest',
    registryVersion: '1.0.0',
    capabilities: [
      {
        id: 'capability-policy',
        name: 'Policy',
        version: '1.0.0',
        packageId: 'runtime-policy-package-1',
        packageType: 'Policy',
        source: 'Runtime Integration Registry',
      },
      {
        id: 'capability-governance',
        name: 'Governance',
        version: '1.0.0',
        packageId: 'runtime-governance-package-1',
        packageType: 'Governance',
        source: 'Runtime Integration Registry',
      },
    ],
    ...overrides,
  };
}

describe('BasicRuntimeManifestStrategy', () => {
  it('generates declarative manifest with packages and dependencies', () => {
    const strategy = createBasicRuntimeManifestStrategy();
    const manifest = strategy.generate(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-08-19T00:00:00.000Z'),
    );
    assert.equal(manifest.capabilities.length, 2);
    assert.ok(manifest.packages.includes('runtime-policy-package-1'));
    assert.deepEqual(
      manifest.capabilities.find((item) => item.id === 'capability-governance')
        ?.dependencies,
      ['capability-policy'],
    );
  });
});

describe('RuntimeManifestValidator', () => {
  it('flags missing session', () => {
    const validator = createRuntimeManifestValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '1.0.0',
      manifest: {
        id: 'm1',
        version: '1.0.0',
        capabilities: [],
        packages: [],
        registryVersion: '1.0.0',
        generatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          sessionId: '',
        },
      },
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        notes: 'n',
        status: 'Draft',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some((item) => item.code === 'manifest-missing-session'),
    );
  });
});

describe('createRuntimeManifestEngine', () => {
  it('collects, generates, validates and publishes', () => {
    const engine = createRuntimeManifestEngine({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const collected = engine.collect(sampleInput());
    assert.equal(collected.sessionId, 'runtime-session-1');

    const pkg = engine.generate(sampleInput());
    assert.equal(pkg.manifest.capabilities.length, 2);
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'RuntimeManifestGenerated'),
    );

    const validation = engine.validate(pkg.id);
    assert.equal(validation.valid, true);

    const published = engine.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      engine
        .getEvents()
        .some((event) => event.type === 'RuntimeManifestPublished'),
    );
  });
});

describe('RuntimeManifestIndex', () => {
  it('indexes manifests', () => {
    const index = createRuntimeManifestIndex();
    const engine = createRuntimeManifestEngine();
    const pkg = engine.generate(sampleInput());
    const entry = index.index(pkg.id, pkg);
    assert.equal(entry.capabilityCount, 2);
    assert.equal(index.find(pkg.manifest.id).length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeManifestApi', () => {
  it('exposes generate / preview / list / validate', () => {
    const api = createRuntimeManifestApi();
    const generated = api.generateRuntimeManifest(sampleInput());
    assert.equal(api.listRuntimeCapabilities(generated.id).length, 2);
    const validated = api.validateRuntimeManifest(generated.id);
    assert.equal(validated.valid, true);
    assert.equal(api.previewRuntimeManifest(generated.id)?.id, generated.id);
  });
});
