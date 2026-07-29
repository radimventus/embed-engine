import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { BuildPublicationPlanInput } from '../../model';
import {
  buildInitialPublicationPlanPackage,
  createBasicPublicationPlanStrategy,
  createPublicationPlanValidator,
} from './basic-publication-plan-strategy';
import { createPublicationPlanApi } from './publication-plan-api';
import { createPublicationPlanBuilder } from './publication-plan-builder';
import { createPublicationPlanIndex } from './publication-plan-index';

function sampleInput(
  overrides: Partial<BuildPublicationPlanInput> = {},
): BuildPublicationPlanInput {
  return {
    rootArtifactId: 'runtime-bootstrap-1',
    dependencies: [
      {
        sourceArtifactId: 'runtime-bootstrap-1',
        targetArtifactId: 'client-publication-1',
        dependencyType: 'REQUIRES',
        status: 'Active',
      },
      {
        sourceArtifactId: 'client-publication-1',
        targetArtifactId: 'published-object-1',
        dependencyType: 'DERIVED_FROM',
        status: 'Active',
      },
      {
        sourceArtifactId: 'published-object-1',
        targetArtifactId: 'publication-object-1',
        dependencyType: 'DERIVED_FROM',
        status: 'Active',
      },
    ],
    title: 'Runtime Bootstrap Plan',
    ...overrides,
  };
}

describe('BasicPublicationPlanStrategy', () => {
  it('builds deterministic ordered plan', () => {
    const strategy = createBasicPublicationPlanStrategy();
    const plan = strategy.build(sampleInput(), (prefix) => `${prefix}-1`);
    assert.equal(plan.rootArtifactId, 'runtime-bootstrap-1');
    assert.equal(plan.steps[0].artifactId, 'publication-object-1');
    assert.equal(plan.steps.at(-1)?.artifactId, 'runtime-bootstrap-1');
  });
});

describe('PublicationPlanValidator', () => {
  it('flags missing root step', () => {
    const validator = createPublicationPlanValidator();
    const pkg = buildInitialPublicationPlanPackage(
      { sessionId: 'publication-plan-session-1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const invalid = {
      ...pkg,
      plan: {
        ...pkg.plan,
        rootArtifactId: 'root-1',
        steps: [],
      },
    };
    assert.equal(validator.validate(invalid).valid, false);
  });
});

describe('createPublicationPlanBuilder', () => {
  it('builds, validates and publishes plan', () => {
    const builder = createPublicationPlanBuilder();
    const pkg = builder.initialize({
      sessionId: 'publication-plan-session-2',
      plan: sampleInput(),
    });
    assert.equal(pkg.metadata.status, 'Active');
    const validation = builder.validate(pkg.id);
    assert.equal(validation.valid, true);
    const published = builder.publish(pkg.id);
    assert.equal(published.plan.status, 'Published');
  });
});

describe('PublicationPlanIndex', () => {
  it('indexes publication plans', () => {
    const index = createPublicationPlanIndex();
    const builder = createPublicationPlanBuilder();
    const pkg = builder.initialize({
      sessionId: 'publication-plan-session-3',
      plan: sampleInput(),
    });
    assert.equal(index.index(pkg.id, pkg).length, 1);
    assert.equal(index.find('runtime-bootstrap-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createPublicationPlanApi', () => {
  it('exposes build, publish, list, find and validate', () => {
    const api = createPublicationPlanApi();
    const created = api.buildPublicationPlan(null, sampleInput(), {
      sessionId: 'publication-plan-session-4',
      title: 'Publication Plan API',
    });
    assert.equal(api.listPublicationPlans().length, 1);
    assert.equal(
      api.findPublicationPlan('runtime-bootstrap-1')?.rootArtifactId,
      'runtime-bootstrap-1',
    );
    assert.equal(api.validatePublicationPlan(created.id).valid, true);
    assert.equal(api.publishPublicationPlan(created.id).plan.status, 'Published');
  });
});
