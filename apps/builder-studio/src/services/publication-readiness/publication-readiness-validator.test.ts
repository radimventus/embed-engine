import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type {
  PublicationCheck,
  ValidatePublicationReadinessInput,
} from '../../model';
import { createPublicationReadinessApi } from './publication-readiness-api';
import {
  createBasicPublicationReadinessStrategy,
  buildInitialPublicationReadinessPackage,
} from './basic-publication-readiness-strategy';
import { createPublicationReadinessIndex } from './publication-readiness-index';
import { createPublicationReadinessValidator } from './publication-readiness-validator';

function sampleInput(
  overrides: Partial<ValidatePublicationReadinessInput> = {},
): ValidatePublicationReadinessInput {
  return {
    publicationId: 'platform-publication-1',
    objectId: 'object-house-1',
    version: '1.0.0',
    title: 'Demo House',
    ...overrides,
  };
}

describe('BasicPublicationReadinessStrategy', () => {
  it('builds READY report and reevaluates status', () => {
    const strategy = createBasicPublicationReadinessStrategy();
    const report = strategy.validate(sampleInput(), (prefix) => `${prefix}-1`);
    assert.equal(report.status, 'READY');
    assert.equal(strategy.evaluate(report).status, 'READY');
  });
});

describe('createPublicationReadinessValidator', () => {
  it('validates, evaluates and publishes readiness', () => {
    const validator = createPublicationReadinessValidator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });
    const pkg = validator.initialize({
      sessionId: 'readiness-session-1',
      title: 'Publication Readiness',
      publication: sampleInput(),
    });
    assert.equal(pkg.metadata.status, 'Validated');
    assert.ok(
      validator
        .getEvents()
        .some((event) => event.type === 'PublicationReadinessValidated'),
    );
    const evaluated = validator.evaluate(pkg.id);
    assert.equal(evaluated.report.status, 'READY');
    const published = validator.publish(pkg.id);
    assert.equal(published.metadata.status, 'Published');
    assert.ok(
      validator
        .getEvents()
        .some((event) => event.type === 'PublicationReadinessPublished'),
    );
  });

  it('produces NOT_READY when a failing check exists', () => {
    const validator = createPublicationReadinessValidator();
    const checks: PublicationCheck[] = [
      {
        id: 'check-1',
        name: 'Missing assets',
        result: 'fail',
        severity: 'error',
        message: 'Required assets are missing.',
      },
    ];
    const pkg = validator.initialize({
      sessionId: 'readiness-session-2',
      publication: sampleInput({ checks }),
    });
    assert.equal(pkg.report.status, 'NOT_READY');
    assert.ok(
      validator
        .getEvents()
        .some((event) => event.type === 'PublicationReadinessFailed'),
    );
  });
});

describe('PublicationReadinessIndex', () => {
  it('indexes readiness packages', () => {
    const index = createPublicationReadinessIndex();
    const validator = createPublicationReadinessValidator();
    const pkg = validator.initialize({
      sessionId: 's1',
      publication: sampleInput(),
    });
    const entries = index.index(pkg.id, pkg);
    assert.equal(entries.length, 1);
    assert.equal(index.find('platform-publication-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createPublicationReadinessApi', () => {
  it('exposes validate, get, list, find and publish', () => {
    const api = createPublicationReadinessApi();
    const created = api.validatePublicationReadiness(null, sampleInput(), {
      sessionId: 'readiness-session-1',
      title: 'API Readiness',
    });
    assert.equal(api.getPublicationReadiness(created.id)?.id, created.id);
    assert.equal(api.listPublicationReadinessReports().length, 1);
    assert.equal(
      api.findPublicationReadiness('platform-publication-1')?.report.publicationId,
      'platform-publication-1',
    );
    const published = api.publishPublicationReadiness(created.id);
    assert.equal(published.metadata.status, 'Published');
  });
});
