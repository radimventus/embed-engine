import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { RegisterArtifactDependencyInput } from '../../model';
import {
  buildInitialArtifactDependencyPackage,
  createArtifactDependencyValidator,
  createBasicArtifactDependencyStrategy,
} from './basic-artifact-dependency-strategy';
import { createArtifactDependencyApi } from './artifact-dependency-api';
import { createArtifactDependencyIndex } from './artifact-dependency-index';
import { createArtifactDependencyRegistry } from './artifact-dependency-registry';

function sampleInput(
  overrides: Partial<RegisterArtifactDependencyInput> = {},
): RegisterArtifactDependencyInput {
  return {
    sourceArtifactId: 'runtime-bootstrap-1',
    targetArtifactId: 'client-publication-1',
    dependencyType: 'REQUIRES',
    title: 'Runtime Bootstrap requires Client Publication',
    ...overrides,
  };
}

describe('BasicArtifactDependencyStrategy', () => {
  it('registers dependencies and rejects self references', () => {
    const strategy = createBasicArtifactDependencyStrategy();
    assert.equal(strategy.supports(sampleInput()), true);
    assert.equal(
      strategy.supports(
        sampleInput({ sourceArtifactId: 'same', targetArtifactId: 'same' }),
      ),
      false,
    );
  });
});

describe('ArtifactDependencyValidator', () => {
  it('detects cycles in active graph', () => {
    const validator = createArtifactDependencyValidator();
    const base = buildInitialArtifactDependencyPackage(
      { sessionId: 'artifact-dependency-session-1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const pkg = {
      ...base,
      dependencies: [
        {
          id: 'dep-1',
          sourceArtifactId: 'a',
          targetArtifactId: 'b',
          dependencyType: 'REQUIRES' as const,
          status: 'Active' as const,
          metadata: { title: 'a->b', notes: 'A' },
        },
        {
          id: 'dep-2',
          sourceArtifactId: 'b',
          targetArtifactId: 'a',
          dependencyType: 'REQUIRES' as const,
          status: 'Active' as const,
          metadata: { title: 'b->a', notes: 'B' },
        },
      ],
    };
    assert.equal(validator.validate(pkg).valid, false);
  });
});

describe('createArtifactDependencyRegistry', () => {
  it('registers, removes, finds and validates dependencies', () => {
    const registry = createArtifactDependencyRegistry();
    let pkg = registry.initialize({
      sessionId: 'artifact-dependency-session-2',
      dependency: sampleInput(),
    });
    pkg = registry.register(
      pkg.id,
      sampleInput({
        sourceArtifactId: 'client-publication-1',
        targetArtifactId: 'published-object-1',
        dependencyType: 'DERIVED_FROM',
      }),
    );
    assert.equal(registry.find('client-publication-1').length, 2);
    const removed = pkg.dependencies[0];
    pkg = registry.remove(pkg.id, removed.id);
    assert.equal(
      pkg.dependencies.find((item) => item.id === removed.id)?.status,
      'Removed',
    );
    assert.equal(registry.validate(pkg.id).valid, true);
  });
});

describe('ArtifactDependencyIndex', () => {
  it('indexes dependencies', () => {
    const index = createArtifactDependencyIndex();
    const registry = createArtifactDependencyRegistry();
    const pkg = registry.initialize({
      sessionId: 'artifact-dependency-session-3',
      dependency: sampleInput(),
    });
    assert.equal(index.index(pkg.id, pkg).length, 1);
    assert.equal(index.find('runtime-bootstrap-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createArtifactDependencyApi', () => {
  it('exposes register, remove, list, find and validate', () => {
    const api = createArtifactDependencyApi();
    let pkg = api.registerArtifactDependency(null, sampleInput(), {
      sessionId: 'artifact-dependency-session-4',
      title: 'Artifact Dependencies API',
    });
    pkg = api.registerArtifactDependency(
      pkg.id,
      sampleInput({
        sourceArtifactId: 'client-publication-1',
        targetArtifactId: 'published-object-1',
      }),
    );
    assert.equal(api.listArtifactDependencies().length, 2);
    assert.equal(api.findArtifactDependency('published-object-1').length, 1);
    assert.equal(api.validateArtifactDependencies(pkg.id).valid, true);
    const removed = api.removeArtifactDependency(pkg.id, pkg.dependencies[0].id);
    assert.equal(removed.dependencies[0].status, 'Removed');
  });
});
