import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { RegisterArtifactVersionInput } from '../../model';
import {
  buildInitialArtifactVersionPackage,
  createArtifactVersionValidator,
  createBasicArtifactVersionStrategy,
} from './basic-artifact-version-strategy';
import { createArtifactVersionApi } from './artifact-version-api';
import { createArtifactVersionIndex } from './artifact-version-index';
import { createArtifactVersionManager } from './artifact-version-manager';

function sampleInput(
  overrides: Partial<RegisterArtifactVersionInput> = {},
): RegisterArtifactVersionInput {
  return {
    artifactId: 'client-publication-1',
    version: '1.0.0',
    artifactType: 'ClientPublication',
    title: 'Client Publication',
    ...overrides,
  };
}

describe('BasicArtifactVersionStrategy', () => {
  it('registers and activates artifact versions', () => {
    const strategy = createBasicArtifactVersionStrategy();
    const first = strategy.register(
      sampleInput({ active: true }),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const second = strategy.register(
      sampleInput({ version: '1.1.0' }),
      (prefix) => `${prefix}-2`,
      () => new Date('2026-07-29T07:00:01.000Z'),
    );
    const activated = strategy.activate(second, [first, second]);
    assert.equal(activated.find((item) => item.id === second.id)?.status, 'ACTIVE');
    assert.equal(
      activated.find((item) => item.id === first.id)?.metadata.active,
      false,
    );
  });
});

describe('ArtifactVersionValidator', () => {
  it('flags duplicate artifact versions', () => {
    const validator = createArtifactVersionValidator();
    const base = buildInitialArtifactVersionPackage(
      { sessionId: 'artifact-version-session-1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const pkg = {
      ...base,
      artifactVersions: [
        {
          id: 'version-1',
          artifactId: 'artifact-1',
          version: '1.0.0',
          status: 'ACTIVE' as const,
          createdAt: '2026-07-29T07:00:00.000Z',
          metadata: {
            title: 'Artifact',
            artifactType: 'Unknown' as const,
            notes: 'A',
            active: true,
          },
        },
        {
          id: 'version-2',
          artifactId: 'artifact-1',
          version: '1.0.0',
          status: 'SUPPORTED' as const,
          createdAt: '2026-07-29T07:00:01.000Z',
          metadata: {
            title: 'Artifact',
            artifactType: 'Unknown' as const,
            notes: 'B',
            active: false,
          },
        },
      ],
    };
    assert.equal(validator.validate(pkg).valid, false);
  });
});

describe('createArtifactVersionManager', () => {
  it('registers, activates, deprecates and validates versions', () => {
    const manager = createArtifactVersionManager();
    let pkg = manager.initialize({
      sessionId: 'artifact-version-session-2',
      version: sampleInput({ active: true }),
    });
    pkg = manager.register(pkg.id, sampleInput({ version: '1.1.0' }));
    const second = pkg.artifactVersions.find((item) => item.version === '1.1.0');
    assert.ok(second);
    pkg = manager.activate(pkg.id, second!.id);
    assert.equal(
      pkg.artifactVersions.find((item) => item.id === second!.id)?.status,
      'ACTIVE',
    );
    pkg = manager.deprecate(pkg.id, second!.id);
    assert.equal(
      pkg.artifactVersions.find((item) => item.id === second!.id)?.status,
      'DEPRECATED',
    );
    assert.equal(manager.validate(pkg.id).valid, true);
  });
});

describe('ArtifactVersionIndex', () => {
  it('indexes artifact versions', () => {
    const index = createArtifactVersionIndex();
    const manager = createArtifactVersionManager();
    const pkg = manager.initialize({
      sessionId: 'artifact-version-session-3',
      version: sampleInput(),
    });
    assert.equal(index.index(pkg.id, pkg).length, 1);
    assert.equal(index.find('client-publication-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createArtifactVersionApi', () => {
  it('exposes register, activate, list, find and validate', () => {
    const api = createArtifactVersionApi();
    let pkg = api.registerArtifactVersion(null, sampleInput({ active: true }), {
      sessionId: 'artifact-version-session-4',
      title: 'Artifact Versions API',
    });
    pkg = api.registerArtifactVersion(
      pkg.id,
      sampleInput({ version: '1.1.0', active: false }),
    );
    const second = pkg.artifactVersions.find((item) => item.version === '1.1.0');
    assert.ok(second);
    pkg = api.activateArtifactVersion(pkg.id, second!.id);
    assert.equal(api.listArtifactVersions().length, 2);
    assert.equal(api.findArtifactVersion('client-publication-1').length, 2);
    assert.equal(api.validateArtifactVersion(pkg.id).valid, true);
  });
});
