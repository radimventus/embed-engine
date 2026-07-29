import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import type { CreateExperienceStateInput } from '../../model';
import {
  createBasicStatePersistenceStrategy,
  createExperienceStateValidator,
} from './basic-state-persistence-strategy';
import { createExperienceStateApi } from './experience-state-api';
import { createExperienceStateManager } from './experience-state-manager';
import { createExperienceStateIndex } from './experience-state-index';

function sampleInput(): CreateExperienceStateInput {
  return {
    sessionId: 'runtime-session-1',
    runtimeExecutionId: 'runtime-execution-1',
    moduleExecutionId: 'module-execution-1',
    activeModule: 'hero',
    activeMove: 'move-1',
    title: 'Demo Experience State',
  };
}

describe('BasicStatePersistenceStrategy', () => {
  it('saves and restores checkpoints', () => {
    const persistence = createBasicStatePersistenceStrategy();
    const saved = persistence.save({
      id: 'cp-1',
      experienceStateId: 'state-1',
      createdAt: '2026-08-19T00:00:00.000Z',
      snapshot: {
        sessionId: 's1',
        runtimeExecutionId: 'r1',
        moduleExecutionId: 'm1',
        currentState: 'Active:hero@move-1',
        status: 'Active',
        activeModule: 'hero',
        activeMove: 'move-1',
        notes: 'n',
      },
      reason: 'test',
      metadata: { notes: 'n', sequence: 1 },
    });
    assert.equal(persistence.restore('cp-1')?.id, saved.id);
    assert.equal(persistence.list('state-1').length, 1);
  });
});

describe('ExperienceStateValidator', () => {
  it('flags dangling checkpoint id', () => {
    const validator = createExperienceStateValidator({
      now: () => new Date('2026-08-19T00:00:00.000Z'),
    });
    const result = validator.validate({
      id: 'p1',
      version: '0.1.0',
      state: {
        id: 'state-1',
        sessionId: 's1',
        runtimeExecutionId: null,
        moduleExecutionId: null,
        currentState: 'Active:none@none',
        status: 'Active',
        checkpointId: 'missing-cp',
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
          activeModule: null,
          activeMove: null,
          restoreStatus: 'None',
          lastCheckpointReason: null,
        },
      },
      checkpoints: [],
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
      result.issues.some((item) => item.code === 'dangling-checkpoint-id'),
    );
  });
});

describe('createExperienceStateManager', () => {
  it('creates, updates, checkpoints, restores and validates', () => {
    const manager = createExperienceStateManager({
      createId: (() => {
        let n = 0;
        return (prefix: string) => {
          n += 1;
          return `${prefix}-${n}`;
        };
      })(),
    });

    const pkg = manager.createState(sampleInput());
    assert.equal(pkg.state.status, 'Active');
    assert.ok(pkg.state.currentState.includes('hero'));
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateCreated'),
    );

    const updated = manager.updateState(pkg.id, {
      activeModule: 'priority',
      activeMove: 'move-2',
      moduleExecutionId: 'module-execution-2',
    });
    assert.equal(updated.state.metadata.activeModule, 'priority');
    assert.ok(updated.state.currentState.includes('priority'));
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateUpdated'),
    );

    const checked = manager.createCheckpoint(updated.id, 'mid-flow');
    assert.ok(checked.state.checkpointId);
    assert.equal(checked.checkpoints.length, 1);
    assert.equal(
      checked.checkpoints[0]?.experienceStateId,
      checked.state.id,
    );
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'CheckpointCreated'),
    );

    const moved = manager.updateState(checked.id, {
      activeModule: 'faq',
      activeMove: 'move-3',
    });
    assert.equal(moved.state.metadata.activeModule, 'faq');

    const restored = manager.restore(moved.id, checked.state.checkpointId!);
    assert.equal(restored.state.status, 'Restored');
    assert.equal(restored.state.metadata.activeModule, 'priority');
    assert.equal(restored.state.metadata.restoreStatus, 'Restored');
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateRestored'),
    );

    const validated = manager.validate(restored.id);
    assert.equal(validated.validation?.valid, true);
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateValidated'),
    );

    const completed = manager.complete(validated.id);
    assert.equal(completed.state.status, 'Completed');
    assert.equal(completed.metadata.status, 'Published');
    assert.ok(manager.getIndex().list(pkg.id).length >= 1);
  });

  it('exposes API create/update/createCheckpoint/restore/list/validate', () => {
    const manager = createExperienceStateManager();
    const api = createExperienceStateApi(manager);
    const pkg = api.createState(sampleInput());
    const updated = api.updateState(pkg.id, { activeModule: 'faq' });
    assert.equal(updated.state.metadata.activeModule, 'faq');
    const checked = api.createCheckpoint(pkg.id, 'api-cp');
    assert.ok(checked.state.checkpointId);
    const restored = api.restoreState(pkg.id, checked.state.checkpointId!);
    assert.equal(restored.state.status, 'Restored');
    assert.ok(api.listStates().length >= 1);
    const validated = api.validateState(pkg.id);
    assert.equal(validated.validation?.valid, true);
  });
});

describe('ExperienceStateIndex', () => {
  it('rebuilds index entries', () => {
    const index = createExperienceStateIndex();
    const rebuilt = index.rebuild([
      {
        id: 'p1',
        state: {
          id: 'state-1',
          sessionId: 's1',
          runtimeExecutionId: null,
          moduleExecutionId: null,
          currentState: 'Active:hero@none',
          status: 'Active',
          checkpointId: null,
          createdAt: '2026-08-19T00:00:00.000Z',
          updatedAt: '2026-08-19T00:00:00.000Z',
          metadata: {
            title: 't',
            notes: 'n',
            activeModule: 'hero',
            activeMove: null,
            restoreStatus: 'None',
            lastCheckpointReason: null,
          },
        },
      },
    ]);
    assert.equal(rebuilt.length, 1);
    assert.equal(index.find('state-1').length, 1);
  });
});
