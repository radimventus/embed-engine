import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { InitializeModulesInput } from '../../model';
import {
  BASIC_MODULE_SEQUENCE,
  createBasicModuleExecutionStrategy,
  createModuleExecutionValidator,
} from './basic-module-execution-strategy';
import { createExperienceModuleCoordinatorApi } from './experience-module-coordinator-api';
import { createExperienceModuleCoordinator } from './experience-module-coordinator';
import { createModuleExecutionIndex } from './module-execution-index';

function sampleInput(): InitializeModulesInput {
  return {
    sessionId: 'runtime-session-1',
    moduleIds: BASIC_MODULE_SEQUENCE,
    title: 'Demo Experience Modules',
  };
}

describe('BasicModuleExecutionStrategy', () => {
  it('supports sequence and resolves next module', () => {
    const strategy = createBasicModuleExecutionStrategy();
    assert.equal(strategy.supports(sampleInput()), true);

    const coordinator = createExperienceModuleCoordinator();
    const pkg = coordinator.initialize(sampleInput());
    const activated = coordinator.activateModule(pkg.id, 'hero');
    const next = strategy.nextModule(activated);
    assert.equal(next.moduleId, 'market-pulse');
    assert.equal(next.completed, false);
  });
});

describe('ModuleExecutionValidator', () => {
  it('flags multiple active modules', () => {
    const validator = createModuleExecutionValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '0.1.0',
      modules: [
        {
          id: 'm1',
          sessionId: 's1',
          moduleId: 'hero',
          status: 'Active',
          startedAt: '2026-08-19T00:00:00.000Z',
          completedAt: null,
          metadata: { label: 'Hero', notes: 'n', sequence: 1 },
        },
        {
          id: 'm2',
          sessionId: 's1',
          moduleId: 'faq',
          status: 'Active',
          startedAt: '2026-08-19T00:00:00.000Z',
          completedAt: null,
          metadata: { label: 'FAQ', notes: 'n', sequence: 2 },
        },
      ],
      transitions: [],
      createdAt: '2026-08-19T00:00:00.000Z',
      updatedAt: '2026-08-19T00:00:00.000Z',
      metadata: {
        title: 't',
        sessionId: 's1',
        activeModuleId: 'hero',
        notes: 'n',
        status: 'Draft',
      },
      validation: null,
    });
    assert.equal(result.valid, false);
    assert.ok(
      result.issues.some((item) => item.code === 'multiple-active-modules'),
    );
  });
});

describe('createExperienceModuleCoordinator', () => {
  it('initializes, activates, transitions, validates and completes', () => {
    const coordinator = createExperienceModuleCoordinator({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = coordinator.initialize(sampleInput());
    assert.equal(pkg.modules.length, BASIC_MODULE_SEQUENCE.length);
    assert.ok(pkg.modules.every((item) => item.status === 'Pending'));

    const activated = coordinator.activateModule(pkg.id, 'hero');
    assert.equal(activated.metadata.activeModuleId, 'hero');
    assert.ok(
      coordinator
        .getEvents(pkg.id)
        .some((event) => event.type === 'ModuleActivated'),
    );

    const transitioned = coordinator.transition(activated.id);
    assert.equal(transitioned.metadata.activeModuleId, 'market-pulse');
    assert.ok(
      coordinator
        .getEvents(pkg.id)
        .some((event) => event.type === 'ModuleTransitioned'),
    );

    const validated = coordinator.validate(transitioned.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      coordinator
        .getEvents(pkg.id)
        .some((event) => event.type === 'ModuleValidated'),
    );

    const completed = coordinator.complete(validated.id);
    assert.equal(completed.metadata.status, 'Published');
    assert.ok(
      completed.modules.every((item) => item.status === 'Completed'),
    );
    assert.ok(
      coordinator
        .getEvents(pkg.id)
        .some((event) => event.type === 'ModuleCompleted'),
    );
    assert.ok(coordinator.getIndex().list(pkg.id).length >= 1);
  });

  it('exposes API activate/transition/complete/list/validate', () => {
    const coordinator = createExperienceModuleCoordinator();
    const api = createExperienceModuleCoordinatorApi(coordinator);
    const pkg = coordinator.initialize(sampleInput());
    const activated = api.activateModule(pkg.id, 'hero');
    assert.equal(activated.metadata.activeModuleId, 'hero');
    const transitioned = api.transitionModule(pkg.id);
    assert.equal(transitioned.metadata.activeModuleId, 'market-pulse');
    assert.ok(api.listModules().length >= 1);
    const validated = api.validateModules(pkg.id);
    assert.equal(validated.validation?.valid, true);
    const completed = api.completeModule(pkg.id);
    assert.equal(completed.metadata.status, 'Published');
  });
});

describe('ModuleExecutionIndex', () => {
  it('rebuilds index entries', () => {
    const index = createModuleExecutionIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        modules: [
          {
            id: 'm1',
            sessionId: 's1',
            moduleId: 'hero',
            status: 'Pending',
            startedAt: null,
            completedAt: null,
            metadata: { label: 'Hero', notes: 'n', sequence: 1 },
          },
        ],
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('m1').length, 1);
  });
});
