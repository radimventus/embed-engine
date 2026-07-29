import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { BuildRuntimeBootstrapInput } from '../../model';
import {
  buildInitialRuntimeBootstrapPackage,
  createBasicRuntimeBootstrapStrategy,
  createRuntimeBootstrapValidator,
} from './basic-runtime-bootstrap-strategy';
import { createRuntimeBootstrapApi } from './runtime-bootstrap-api';
import { createRuntimeBootstrapIndex } from './runtime-bootstrap-index';
import { createRuntimeSessionBootstrap } from './runtime-session-bootstrap';

function sampleInput(
  overrides: Partial<BuildRuntimeBootstrapInput> = {},
): BuildRuntimeBootstrapInput {
  return {
    publicationId: 'platform-publication-1',
    objectId: 'object-house-1',
    runtimeVersion: '2026.07',
    bootstrapVersion: '1.0.0',
    title: 'Runtime Bootstrap',
    readinessStatus: 'READY',
    ...overrides,
  };
}

describe('BasicRuntimeBootstrapStrategy', () => {
  it('builds and publishes runtime session bootstrap', () => {
    const strategy = createBasicRuntimeBootstrapStrategy();
    const session = strategy.build(sampleInput(), (prefix) => `${prefix}-1`);
    assert.equal(session.metadata.sessionState, 'Prepared');
    assert.equal(strategy.publish(session).metadata.sessionState, 'Published');
  });
});

describe('RuntimeBootstrapValidator', () => {
  it('flags unknown readiness as warning only', () => {
    const validator = createRuntimeBootstrapValidator();
    const pkg = buildInitialRuntimeBootstrapPackage(
      { sessionId: 'bootstrap-session-1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const validation = validator.validate(pkg);
    assert.equal(validation.valid, true);
    assert.ok(validation.issues.some((issue) => issue.severity === 'warning'));
  });
});

describe('createRuntimeSessionBootstrap', () => {
  it('builds, validates and publishes bootstrap package', () => {
    const bootstrap = createRuntimeSessionBootstrap({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });
    const pkg = bootstrap.initialize({
      sessionId: 'bootstrap-session-2',
      bootstrap: sampleInput(),
    });
    assert.equal(pkg.metadata.status, 'Active');
    const validation = bootstrap.validate(pkg.id);
    assert.equal(validation.valid, true);
    const published = bootstrap.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      bootstrap
        .getEvents()
        .some((event) => event.type === 'RuntimeBootstrapPublished'),
    );
  });

  it('records failure for invalid bootstrap', () => {
    const bootstrap = createRuntimeSessionBootstrap();
    const pkg = bootstrap.initialize({
      sessionId: 'bootstrap-session-3',
      bootstrap: sampleInput({ publicationId: '', readinessStatus: 'NOT_READY' }),
    });
    const validation = bootstrap.validate(pkg.id);
    assert.equal(validation.valid, false);
    assert.ok(
      bootstrap
        .getEvents()
        .some((event) => event.type === 'RuntimeBootstrapFailed'),
    );
  });
});

describe('RuntimeBootstrapIndex', () => {
  it('indexes bootstrap packages', () => {
    const index = createRuntimeBootstrapIndex();
    const bootstrap = createRuntimeSessionBootstrap();
    const pkg = bootstrap.initialize({
      sessionId: 'bootstrap-session-4',
      bootstrap: sampleInput(),
    });
    assert.equal(index.index(pkg.id, pkg).length, 1);
    assert.equal(index.find('platform-publication-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createRuntimeBootstrapApi', () => {
  it('exposes build, publish, list, find and validate', () => {
    const api = createRuntimeBootstrapApi();
    const created = api.buildRuntimeBootstrap(null, sampleInput(), {
      sessionId: 'bootstrap-session-5',
      title: 'Runtime Bootstrap API',
    });
    assert.equal(api.getPackage(created.id)?.id, created.id);
    assert.equal(api.listRuntimeBootstraps().length, 1);
    assert.equal(
      api.findRuntimeBootstrap('platform-publication-1')?.publicationId,
      'platform-publication-1',
    );
    assert.equal(api.validateRuntimeBootstrap(created.id).valid, true);
    assert.equal(api.publishRuntimeBootstrap(created.id).metadata.status, 'Published');
  });
});
