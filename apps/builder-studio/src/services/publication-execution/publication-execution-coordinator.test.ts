import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { StartPublicationExecutionInput } from '../../model';
import {
  buildInitialPublicationExecutionPackage,
  createBasicPublicationExecutionStrategy,
  createPublicationExecutionValidator,
} from './basic-publication-execution-strategy';
import { createPublicationExecutionApi } from './publication-execution-api';
import { createPublicationExecutionCoordinator } from './publication-execution-coordinator';
import { createPublicationExecutionIndex } from './publication-execution-index';

function sampleInput(
  overrides: Partial<StartPublicationExecutionInput> = {},
): StartPublicationExecutionInput {
  return {
    planId: 'publication-plan-1',
    rootArtifactId: 'runtime-bootstrap-1',
    totalSteps: 3,
    title: 'Execution Session',
    ...overrides,
  };
}

describe('BasicPublicationExecutionStrategy', () => {
  it('starts and executes deterministic steps', () => {
    const strategy = createBasicPublicationExecutionStrategy();
    const started = strategy.start(
      sampleInput(),
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    assert.equal(started.status, 'RUNNING');
    const step1 = strategy.execute(started, () => new Date('2026-07-29T07:01:00.000Z'));
    assert.equal(step1.currentStep, 1);
  });
});

describe('PublicationExecutionValidator', () => {
  it('flags invalid completed session without finishedAt', () => {
    const validator = createPublicationExecutionValidator();
    const pkg = buildInitialPublicationExecutionPackage(
      { sessionId: 'publication-execution-session-1' },
      (prefix) => `${prefix}-1`,
      () => new Date('2026-07-29T07:00:00.000Z'),
    );
    const invalid = {
      ...pkg,
      session: {
        ...pkg.session,
        planId: 'plan-1',
        status: 'COMPLETED' as const,
        finishedAt: null,
        metadata: {
          ...pkg.session.metadata,
          rootArtifactId: 'artifact-1',
          totalSteps: 1,
          completedSteps: 1,
        },
      },
    };
    assert.equal(validator.validate(invalid).valid, false);
  });
});

describe('createPublicationExecutionCoordinator', () => {
  it('starts, executes and completes execution', () => {
    const coordinator = createPublicationExecutionCoordinator();
    let pkg = coordinator.initialize({
      sessionId: 'publication-execution-session-2',
      execution: sampleInput(),
    });
    pkg = coordinator.executeStep(pkg.id);
    assert.equal(pkg.session.currentStep, 1);
    pkg = coordinator.executeStep(pkg.id);
    pkg = coordinator.executeStep(pkg.id);
    assert.equal(pkg.session.status, 'COMPLETED');
    assert.equal(coordinator.validate(pkg.id).valid, true);
  });
});

describe('PublicationExecutionIndex', () => {
  it('indexes execution packages', () => {
    const index = createPublicationExecutionIndex();
    const coordinator = createPublicationExecutionCoordinator();
    const pkg = coordinator.initialize({
      sessionId: 'publication-execution-session-3',
      execution: sampleInput(),
    });
    assert.equal(index.index(pkg.id, pkg).length, 1);
    assert.equal(index.find('publication-plan-1').length, 1);
    assert.equal(index.rebuild([pkg]).length, 1);
  });
});

describe('createPublicationExecutionApi', () => {
  it('exposes start, execute, list, find and validate', () => {
    const api = createPublicationExecutionApi();
    let pkg = api.startPublicationExecution(null, sampleInput(), {
      sessionId: 'publication-execution-session-4',
      title: 'Execution API',
    });
    pkg = api.executePublicationStep(pkg.id);
    assert.equal(api.listPublicationExecutions().length, 1);
    assert.equal(
      api.findPublicationExecution('publication-plan-1')?.planId,
      'publication-plan-1',
    );
    assert.equal(api.validatePublicationExecution(pkg.id).valid, true);
  });
});
