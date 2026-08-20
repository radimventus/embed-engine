import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  FileDecisionSessionRepository,
  DecisionSessionScopeMismatchError,
} from './decisionSessionRepository';

const SESSION_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function serialized(houseId: string, withIntensity = true) {
  return {
    format: 'decision-session',
    schemaVersion: '1.0',
    objectId: houseId,
    runtimeState: {
      activeRoomId: 'room-living',
      priorityIds: ['layout', 'energy'],
      priorityIntensities: withIntensity
        ? { layout: 0.9, energy: 0.4 }
        : null,
      variantId: null,
      scenarioId: null,
      version: 2,
    },
    events: [
      { type: 'RoomSelected', roomId: 'room-living', at: 2 },
      {
        type: 'PriorityChanged',
        priorityIds: ['layout', 'energy'],
        ...(withIntensity
          ? {
              intensities: [
                { priorityId: 'layout', importance: 0.9 },
                { priorityId: 'energy', importance: 0.4 },
              ],
            }
          : {}),
        at: 3,
      },
    ],
    createdAt: 1,
    updatedAt: 3,
  };
}

test('FileDecisionSessionRepository persists a House-scoped session with intensities', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-decision-session-'));
  const statePath = join(dir, 'decision-sessions.json');
  try {
    const repository = new FileDecisionSessionRepository(statePath);
    const created = await repository.upsert({
      decisionSessionId: SESSION_ID,
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-a',
      serialized: serialized('house-a'),
    });
    assert.equal(created.decisionSessionId, SESSION_ID);
    assert.equal(created.houseId, 'house-a');
    assert.deepEqual(
      created.serialized.runtimeState.priorityIds,
      ['layout', 'energy'],
    );
    assert.deepEqual(created.serialized.runtimeState.priorityIntensities, {
      layout: 0.9,
      energy: 0.4,
    });
    assert.equal(
      created.serialized.events.some((event) => event.type === 'RoomSelected'),
      true,
    );

    const fresh = new FileDecisionSessionRepository(statePath);
    const restored = await fresh.getByScopeAndId({
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-a',
      decisionSessionId: SESSION_ID,
    });
    assert.deepEqual(restored, created);

    assert.equal(
      await fresh.getByScopeAndId({
        companyId: 'company-a',
        projectId: 'project-a',
        houseId: 'house-b',
        decisionSessionId: SESSION_ID,
      }),
      null,
    );
    assert.equal(
      await fresh.getByScopeAndId({
        companyId: 'company-a',
        projectId: 'project-b',
        houseId: 'house-a',
        decisionSessionId: SESSION_ID,
      }),
      null,
    );
    assert.equal(
      await fresh.getByScopeAndId({
        companyId: 'company-b',
        projectId: 'project-a',
        houseId: 'house-a',
        decisionSessionId: SESSION_ID,
      }),
      null,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileDecisionSessionRepository rejects reusing an id under another House', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-decision-session-scope-'));
  const statePath = join(dir, 'decision-sessions.json');
  try {
    const repository = new FileDecisionSessionRepository(statePath);
    await repository.upsert({
      decisionSessionId: SESSION_ID,
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-a',
      serialized: serialized('house-a'),
    });
    await assert.rejects(
      () =>
        repository.upsert({
          decisionSessionId: SESSION_ID,
          companyId: 'company-a',
          projectId: 'project-a',
          houseId: 'house-b',
          serialized: serialized('house-b'),
        }),
      (error: unknown) => error instanceof DecisionSessionScopeMismatchError,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('FileDecisionSessionRepository accepts older sessions with ids only', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'conis-decision-session-legacy-'));
  const statePath = join(dir, 'decision-sessions.json');
  try {
    const repository = new FileDecisionSessionRepository(statePath);
    const created = await repository.upsert({
      decisionSessionId: SESSION_ID,
      companyId: 'company-a',
      projectId: 'project-a',
      houseId: 'house-a',
      serialized: serialized('house-a', false),
    });
    assert.equal(created.serialized.runtimeState.priorityIntensities, null);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
