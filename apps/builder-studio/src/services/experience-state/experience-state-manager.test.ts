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
    executionId: 'decision-execution-1',
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
      stateId: 'state-1',
      timestamp: '2026-08-19T00:00:00.000Z',
      snapshot: {
        sessionId: 's1',
        executionId: 'e1',
        activeModule: 'hero',
        activeMove: 'move-1',
        status: 'Active',
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
        executionId: null,
        activeModule: null,
        activeMove: null,
        status: 'Active',
        checkpointId: 'missing-cp',
        createdAt: '2026-08-19T00:00:00.000Z',
        updatedAt: '2026-08-19T00:00:00.000Z',
        metadata: {
          title: 't',
          notes: 'n',
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
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateCreated'),
    );

    const updated = manager.updateState(pkg.id, {
      activeModule: 'priority',
      activeMove: 'move-2',
    });
    assert.equal(updated.state.activeModule, 'priority');
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'ExperienceStateUpdated'),
    );

    const checked = manager.checkpoint(updated.id, 'mid-flow');
    assert.ok(checked.state.checkpointId);
    assert.equal(checked.checkpoints.length, 1);
    assert.ok(
      manager
        .getEvents(pkg.id)
        .some((event) => event.type === 'CheckpointCreated'),
    );

    const moved = manager.updateState(checked.id, {
      activeModule: 'faq',
      activeMove: 'move-3',
    });
    assert.equal(moved.state.activeModule, 'faq');

    const restored = manager.restore(moved.id, checked.state.checkpointId!);
    assert.equal(restored.state.status, 'Restored');
    assert.equal(restored.state.activeModule, 'priority');
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

  it('exposes API create/update/checkpoint/restore/list/validate', () => {
    const manager = createExperienceStateManager();
    const api = createExperienceStateApi(manager);
    const pkg = api.createState(sampleInput());
    const updated = api.updateState(pkg.id, { activeModule: 'faq' });
    assert.equal(updated.state.activeModule, 'faq');
    const checked = api.checkpoint(pkg.id, 'api-cp');
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
          executionId: null,
          activeModule: 'hero',
          activeMove: null,
          status: 'Active',
          checkpointId: null,
          createdAt: '2026-08-19T00:00:00.000Z',
          updatedAt: '2026-08-19T00:00:00.000Z',
          metadata: {
            title: 't',
            notes: 'n',
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
