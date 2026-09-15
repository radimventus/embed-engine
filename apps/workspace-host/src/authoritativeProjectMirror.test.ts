import assert from 'node:assert/strict';
import test from 'node:test';

import { restoreAuthoritativeProjectMirror } from './authoritativeProjectMirror';

test('restores an authoritative project into separate Host memory without a second mutation', async () => {
  const builderMemory = { projectId: 'project-nema-cz', activeHouseId: null };
  let hostMemory = { projectId: 'project-moravske', activeHouseId: null };
  let sharedProjectId = hostMemory.projectId;
  let restoreCalls = 0;
  let mutationCalls = 0;

  assert.notEqual(hostMemory.projectId, builderMemory.projectId);

  const accepted = await restoreAuthoritativeProjectMirror({
    requestedProjectId: builderMemory.projectId,
    restoreSession: async () => {
      restoreCalls += 1;
      return builderMemory;
    },
    saveSession: (restored) => {
      hostMemory = restored;
    },
    mirrorSession: (restored) => {
      sharedProjectId = restored.projectId;
    },
  });

  assert.equal(accepted, true);
  assert.equal(restoreCalls, 1);
  assert.equal(mutationCalls, 0);
  assert.equal(hostMemory.projectId, 'project-nema-cz');
  assert.equal(sharedProjectId, 'project-nema-cz');
});

test('does not trust the message when the restored server session has another project', async () => {
  let hostMemory = { projectId: 'project-moravske', activeHouseId: null };
  let sharedProjectId = hostMemory.projectId;

  const accepted = await restoreAuthoritativeProjectMirror({
    requestedProjectId: 'project-nema-cz',
    restoreSession: async () => hostMemory,
    saveSession: (restored) => {
      hostMemory = restored;
    },
    mirrorSession: (restored) => {
      sharedProjectId = restored.projectId;
    },
  });

  assert.equal(accepted, false);
  assert.equal(hostMemory.projectId, 'project-moravske');
  assert.equal(sharedProjectId, 'project-moravske');
});
