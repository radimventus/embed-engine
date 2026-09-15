import assert from 'node:assert/strict';
import test from 'node:test';

import { runBuilderProjectAuthorityOrder } from './builderProjectAuthorityOrder';

test('P1 → P2 → H2 → P3 → H3 preserves Project-before-House authority', async () => {
  let serverProject = 'P1';
  let builderProject = 'P1';
  let hostProject = 'P1';
  const events: string[] = [];
  const transition = async (projectId: string, houseId: string) =>
    runBuilderProjectAuthorityOrder({
      switchProject: async () => {
        events.push(`project:${projectId}`);
        serverProject = projectId;
        return true;
      },
      applyProjectProjection: () => { builderProject = projectId; },
      confirmHostProject: async () => {
        events.push(`host-read:${serverProject}`);
        if (serverProject !== projectId) return false;
        hostProject = serverProject;
        return true;
      },
      synchronizeHouse: async () => {
        events.push(`house:${houseId}@${hostProject}`);
        assert.equal(hostProject, projectId);
        return houseId;
      },
    });

  assert.deepEqual(await transition('P2', 'H2'), { ok: true, value: 'H2' });
  assert.equal(builderProject, 'P2');
  assert.deepEqual(await transition('P3', 'H3'), { ok: true, value: 'H3' });
  assert.equal(builderProject, 'P3');
  assert.deepEqual(events, [
    'project:P2', 'host-read:P2', 'house:H2@P2',
    'project:P3', 'host-read:P3', 'house:H3@P3',
  ]);
});

test('does not activate House when Host cannot confirm the requested Project', async () => {
  let houseActivations = 0;
  const result = await runBuilderProjectAuthorityOrder({
    switchProject: async () => true,
    applyProjectProjection: () => undefined,
    confirmHostProject: async () => false,
    synchronizeHouse: async () => {
      houseActivations += 1;
      return 'cross-project-house';
    },
  });
  assert.deepEqual(result, { ok: false, stage: 'host' });
  assert.equal(houseActivations, 0);
});
